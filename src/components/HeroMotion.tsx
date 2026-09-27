"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
gsap.registerPlugin(useGSAP);

export default function HeroMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".tile-fan", {
        y: 15,
        rotate: -2,
        duration: 1,
        ease: "power2.out",
      });
    });
    mm.add(
      "(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const area = document.querySelector<HTMLElement>(".hero-objects");
        const fan = document.querySelector(".tile-fan");
        if (!area || !fan) return;
        const x = gsap.quickTo(fan, "rotationY", {
          duration: 0.6,
          ease: "power2.out",
        });
        const y = gsap.quickTo(fan, "rotationX", {
          duration: 0.6,
          ease: "power2.out",
        });
        const move = (e: PointerEvent) => {
          const r = area.getBoundingClientRect();
          x(((e.clientX - r.left - r.width / 2) / r.width) * 5);
          y((-(e.clientY - r.top - r.height / 2) / r.height) * 5);
        };
        const leave = () => {
          x(0);
          y(0);
        };
        area.addEventListener("pointermove", move);
        area.addEventListener("pointerleave", leave);
        return () => {
          area.removeEventListener("pointermove", move);
          area.removeEventListener("pointerleave", leave);
          x.tween.kill();
          y.tween.kill();
          gsap.set(fan, { clearProps: "rotationX,rotationY" });
        };
      },
    );
    return () => mm.revert();
  });
  return null;
}
