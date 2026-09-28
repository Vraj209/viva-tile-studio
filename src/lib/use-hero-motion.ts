"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";

// All six faces share one CSS dimension. Only position, angle and depth vary.
export const atelierPoses = [
  { x: 49, y: 25, angle: -6, depth: 0 },
  { x: 75, y: 38, angle: 7, depth: 2 },
  { x: 25, y: 41, angle: -10, depth: 4 },
  { x: 27, y: 70, angle: -7, depth: 6 },
  { x: 74, y: 69, angle: 8, depth: 8 },
  { x: 48, y: 58, angle: -4, depth: 10 },
] as const;

export function useHeroMotion(stageRef: RefObject<HTMLDivElement | null>, active: number | null, still: boolean) {
  const current = useRef({ active, still });
  const controller = useRef<(() => void) | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const tiles = [...stage.querySelectorAll<HTMLElement>("[data-atelier-tile]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let motion: gsap.core.Timeline | undefined;
    let entrance: gsap.core.Tween | undefined;
    let width = stage.clientWidth;
    let height = stage.clientHeight;
    const context = gsap.context(() => {
      gsap.set(tiles, {
        xPercent: -50, yPercent: -50, x: 0, y: 0,
        z: (i) => atelierPoses[i].depth,
        rotation: (i) => atelierPoses[i].angle,
      });
      if (!reduced.matches && !current.current.still) {
        entrance = gsap.from(tiles.slice(0, -1), {
          y: 12, duration: .75, stagger: .045, ease: "power3.out", delay: .06,
        });
      }
    }, stage);

    const settle = () => {
      entrance?.kill();
      motion?.kill();
      const selected = current.current.active;
      const noMotion = reduced.matches || current.current.still;
      const selectedPose = selected === null ? null : atelierPoses[selected];
      const duration = selected === null ? .78 : .72;
      motion = noMotion ? undefined : gsap.timeline();

      tiles.forEach((tile, index) => {
        const pose = atelierPoses[index];
        const isActive = index === selected;
        const dx = selectedPose ? pose.x - selectedPose.x : 0;
        const dy = selectedPose ? pose.y - selectedPose.y : 0;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const separation = Math.max(.006, .026 - distance * .00025);
        const x = isActive
          ? (pose.x < 35 ? -.035 : pose.x > 65 ? .025 : -.012) * width
          : selectedPose ? dx / distance * width * separation : 0;
        const y = isActive
          ? (pose.y < 40 ? -.045 : -.027) * height
          : selectedPose ? dy / distance * height * separation : 0;
        const z = isActive ? 64 : selectedPose ? pose.depth - 8 : pose.depth;

        if (noMotion) {
          gsap.set(tile, { x: 0, y: 0, z: isActive ? 16 : pose.depth, rotation: pose.angle });
          return;
        }

        // New destinations begin at the rendered pose, without restarting
        // recognition or instantly swapping the stacking order.
        motion!.to(tile, {
          x, y, rotation: isActive ? -1 : pose.angle,
          duration, ease: "power3.out",
        }, 0);
        // Lateral movement leads the slower depth exchange. CSS sorts the
        // actual planes continuously instead of toggling their z-index.
        motion!.to(tile, { z, duration, ease: "sine.inOut" }, 0);
      });
    };
    controller.current = settle;
    const observer = new ResizeObserver(() => {
      if (width === stage.clientWidth && height === stage.clientHeight) return;
      width = stage.clientWidth;
      height = stage.clientHeight;
      settle();
    });
    observer.observe(stage);
    reduced.addEventListener("change", settle);
    return () => {
      entrance?.kill();
      motion?.kill();
      observer.disconnect();
      reduced.removeEventListener("change", settle);
      controller.current = null;
      context.revert();
      gsap.set(tiles, { clearProps: "transform,zIndex" });
    };
  }, [stageRef]);

  useEffect(() => {
    const changed = current.current.active !== active || current.current.still !== still;
    current.current = { active, still };
    if (changed) controller.current?.();
  }, [active, still]);
}
