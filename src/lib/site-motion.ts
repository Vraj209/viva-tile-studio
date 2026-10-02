"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/** Opt-in motion keeps reading surfaces and interactive controls still. */
export function createSiteMotion(scope: HTMLElement): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopQuery = window.matchMedia("(min-width: 769px) and (pointer: fine)");

  const create = () => gsap.context(
    () => {
      if (reduced.matches) return;
      const desktop = desktopQuery.matches;
      const reveals = new Map<HTMLElement, gsap.core.Tween>();
      const cleanups: (() => void)[] = [];

      scope.querySelectorAll<HTMLElement>("[data-motion]").forEach((group) => {
        const items = Array.from(group.querySelectorAll<HTMLElement>("[data-motion-item]"));
        if (!items.length) return;
        const kind = group.dataset.motion;
        const opening = kind === "hero";
        const quiet = kind === "quiet" || kind === "footer";
        const top = group.getBoundingClientRect().top;
        // Restored scroll positions and direct anchors should show their content immediately.
        if (!opening && top < window.innerHeight * 0.85) return;
        if (opening && window.scrollY > window.innerHeight * 0.5) return;

        const reveal = gsap.fromTo(
          items,
          { y: opening ? 8 : quiet ? 6 : desktop ? 16 : 9, opacity: opening ? 0.82 : quiet ? 0.65 : 0.3 },
          {
            y: 0,
            opacity: 1,
            duration: opening ? 0.85 : quiet ? 0.7 : 0.9,
            stagger: desktop ? (kind === "process-step" ? 0.09 : 0.11) : 0.055,
            ease: "power2.out",
            clearProps: "transform,opacity",
            // Leave waiting sections at their normal contrast until their entrance plays.
            immediateRender: opening,
            ...(opening
              ? {}
              : { scrollTrigger: { trigger: group, start: "top 89%", once: true } }),
          },
        );
        reveals.set(group, reveal);
      });

      // A keyboard jump never waits for an entrance to finish, including future opt-in groups.
      const revealFocused = (event: FocusEvent) => {
        if (!(event.target instanceof Element)) return;
        const section = event.target.closest("section, footer");
        reveals.forEach((reveal, group) => {
          if (group.contains(event.target as Node) || section?.contains(group)) {
            reveal.progress(1);
            reveal.scrollTrigger?.kill();
          }
        });
      };
      scope.addEventListener("focusin", revealFocused);
      cleanups.push(() => scope.removeEventListener("focusin", revealFocused));

      scope.querySelectorAll<HTMLElement>("[data-motion-depth]").forEach((visual) => {
          const kind = visual.dataset.motionDepth;
          const atelier = kind === "atelier" ? visual.closest<HTMLElement>("[data-still]") : null;
          const section = visual.closest("section, footer");
          if (!section) return;
          const depth = gsap.fromTo(
            visual,
            { y: kind === "tile" ? (desktop ? 22 : 8) : 0 },
            {
              y: kind === "atelier" ? (desktop ? 64 : 20) : kind === "tile" ? (desktop ? -22 : -8) : (desktop ? -28 : -10),
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: kind === "atelier" ? "top top" : "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );

          if (atelier) {
            const syncStill = () => {
              if (atelier.dataset.still === "true") {
                depth.scrollTrigger?.disable(false);
                depth.progress(0);
              } else {
                depth.scrollTrigger?.enable(false);
                depth.scrollTrigger?.update();
              }
            };
            const observer = new MutationObserver(syncStill);
            observer.observe(atelier, { attributes: true, attributeFilter: ["data-still"] });
            syncStill();
            cleanups.push(() => observer.disconnect());
          }
      });

      // Images move inside a stationary aperture. Overscan exceeds the full
      // translation at either edge; mobile retains a smaller native-scroll drift.
      scope.querySelectorAll<HTMLElement>("[data-motion-image]").forEach((visual) => {
        const frame = visual.closest<HTMLElement>("[data-motion-frame]");
        if (!frame) return;
        const travel = desktop ? 3.5 : 1.25;
        gsap.fromTo(visual, { yPercent: travel, scale: desktop ? 1.09 : 1.04 }, {
          yPercent: -travel,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: frame.closest("footer") ? "bottom bottom" : "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    scope,
  );

  let context = create();
  // Rebuild only this scope: GSAP's global matchMedia refresh can reset restored scroll.
  const rebuild = () => {
    context.revert();
    context = create();
    requestScrollRefresh();
  };
  reduced.addEventListener("change", rebuild);
  desktopQuery.addEventListener("change", rebuild);
  requestScrollRefresh();
  return () => {
    reduced.removeEventListener("change", rebuild);
    desktopQuery.removeEventListener("change", rebuild);
    context.revert();
  };
}
