import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import type { Brochure } from "@/lib/brochures";
import { getPageStrips, type BrochureSpread } from "@/lib/brochure-reader";
import styles from "./BrochureReader.module.css";

export type ReaderTurn = {
  from: BrochureSpread;
  to: BrochureSpread;
  front: number | null;
  back: number | null;
  destination: number;
  direction: 1 | -1;
  rigid: boolean;
};

/** The gesture controller and the leaf share one progress value outside React. */
export type TurnMotion = {
  progress: number;
  dragging: boolean;
  target: 0 | 1;
  render?: () => void;
  settle?: () => void;
};

type Props = {
  brochure: Brochure;
  turn: ReaderTurn;
  compact: boolean;
  reduced: boolean;
  motion: TurnMotion;
  onComplete: (committed: boolean) => void;
};

export default function BrochureTurningLeaf({ brochure, turn, compact, reduced, motion, onComplete }: Props) {
  const layer = useRef<HTMLDivElement>(null);
  const complete = useRef(onComplete);
  const motionRef = useRef(motion);
  useLayoutEffect(() => { complete.current = onComplete; motionRef.current = motion; });

  useLayoutEffect(() => {
    const root = layer.current!;
    const bookOffset = root.closest<HTMLElement>("[data-book-offset]");
    const strips = Array.from(root.querySelectorAll<HTMLElement>("[data-strip]"));
    const compactLeaf = root.querySelector<HTMLElement>("[data-compact-leaf]");
    const shadow = root.querySelector<HTMLElement>("[data-turn-shadow]")!;
    const controller = motionRef.current;
    let tween: gsap.core.Tween | undefined;
    let disposed = false;
    let finished = false;

    const render = () => {
      const progress = Math.max(0, Math.min(1, controller.progress));
      const width = root.clientWidth;
      const height = root.clientHeight;
      const lift = Math.sin(Math.PI * progress);

      if (compactLeaf) {
        // A single-page viewport has no facing page for a physical back face.
        // Keep the outgoing artwork intact while revealing the prepared page.
        compactLeaf.style.transform = `translate3d(${-turn.direction * progress * width}px,0,0) rotateY(${-turn.direction * lift * 6}deg)`;
        compactLeaf.style.transformOrigin = turn.direction === 1 ? "left center" : "right center";
        const shadowWidth = .12 + lift * .1;
        const edge = turn.direction === 1 ? width * (1 - progress) : width * progress;
        shadow.style.transform = `translateX(${edge - (turn.direction === -1 ? width * shadowWidth : 0)}px) scaleX(${shadowWidth})`;
        shadow.style.background = `linear-gradient(${turn.direction === 1 ? 90 : 270}deg, #1b160d, transparent)`;
        shadow.style.opacity = `${lift * .16}`;
      } else {
        const geometry = getPageStrips(progress, width, strips.length, turn.rigid, turn.direction);
        geometry.forEach((strip, index) => {
          const element = strips[index];
          // Overlap subpixels between strips without extending past the artwork.
          const renderedWidth = Math.min(strip.width + .6, width - index * strip.width);
          element.style.width = `${renderedWidth}px`;
          element.style.transform = `translate3d(${strip.x}px,0,${strip.z + 2}px) rotateY(${strip.angle}deg)`;
          const front = element.children[0] as HTMLElement;
          const back = element.children[1] as HTMLElement;
          front.style.backgroundSize = back.style.backgroundSize = `${width}px ${height}px`;
          front.style.backgroundPosition = `${-index * strip.width}px 0`;
          back.style.backgroundPosition = `${-(width - index * strip.width - renderedWidth)}px 0`;
          element.style.setProperty("--leaf-shade", `${lift * (.018 + index / strips.length * .065)}`);
        });
        shadow.style.opacity = `${lift * .2}`;
        shadow.style.transform = `scaleX(${.15 + lift * .85})`;
      }

      if (bookOffset && !compact) {
        const start = turn.from.left === null ? -25 : 0;
        const end = turn.to.left === null ? -25 : 0;
        bookOffset.style.transform = `translateX(${start + (end - start) * progress}%)`;
      }
    };

    const settle = (automatic = false) => {
      if (disposed || finished) return;
      tween?.kill();
      controller.dragging = false;
      const target = controller.target;
      const finish = () => {
        if (disposed || finished) return;
        finished = true;
        controller.progress = target;
        render();
        complete.current(target === 1);
      };
      const remaining = Math.abs(target - controller.progress);
      if (reduced || remaining < .0001) { finish(); return; }
      tween = gsap.to(controller, {
        progress: target,
        duration: automatic ? turn.rigid ? .56 : .5 : Math.max(.18, Math.min(.52, .52 * remaining)),
        ease: automatic ? "power2.inOut" : "power2.out",
        onUpdate: render,
        onComplete: finish,
      });
    };

    const settleGesture = () => settle();
    controller.render = render;
    controller.settle = settleGesture;
    // Lay out the whole textured sheet before the browser's first paint.
    render();
    const observer = new ResizeObserver(render);
    observer.observe(root);
    if (!controller.dragging) settle(true);

    return () => {
      disposed = true;
      tween?.kill();
      observer.disconnect();
      if (controller.render === render) delete controller.render;
      if (controller.settle === settleGesture) delete controller.settle;
    };
  }, [turn, compact, reduced, motion]);

  const texture = (index: number | null) => index === null ? undefined : `url("${brochure.pages[index].src}")`;

  return (
    <div ref={layer} className={styles.turnLayer} aria-hidden="true" data-rigid={turn.rigid} data-compact-turn={compact}>
      <div className={styles.turnShadow} data-turn-shadow />
      {compact ? (
        <div className={styles.compactLeaf} data-compact-leaf style={{ backgroundImage: texture(turn.from.right) }} />
      ) : Array.from({ length: turn.rigid ? 1 : 14 }, (_, index) => (
        <div key={index} className={styles.strip} data-strip>
          <div className={styles.stripFront} style={{ backgroundImage: texture(turn.front) }} />
          <div className={styles.stripBack} style={{ backgroundImage: texture(turn.back) }} />
        </div>
      ))}
    </div>
  );
}
