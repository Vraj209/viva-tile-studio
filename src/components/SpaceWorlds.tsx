"use client";

import Image from "next/image";
import { lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { spaceWorlds, type SpaceId } from "@/lib/space-worlds";
import { requestScrollRefresh, scrollToTarget } from "@/lib/scroll";
import type { JourneyOrigin } from "./SpaceJourney";
import Arrow from "./Arrow";
import styles from "./SpaceWorlds.module.css";

const SpaceJourney = lazy(() => import("./SpaceJourney"));
gsap.registerPlugin(ScrollTrigger);

export default function SpaceWorlds() {
  const [active, setActive] = useState<JourneyOrigin | null>(null);
  const [business, setBusiness] = useState<"hospitality" | "workspace">("hospitality");
  const opener = useRef<HTMLButtonElement | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const portals: SpaceId[] = ["home", "design", business];

  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const desktop = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    let context: gsap.Context | undefined;
    // The picture has its own transform so the established image hover survives.
    // Touch keeps native document scrolling, with a lighter image drift.
    const configure = () => {
      context?.revert();
      context = undefined;
      if (media.matches) {
        context = gsap.context(() => {
          root.current?.querySelectorAll<HTMLElement>("[data-opening]").forEach((opening) => {
            const picture = opening.querySelector("picture");
            const travel = desktop.matches ? 3.5 : 1.25;
            gsap.fromTo(picture, { yPercent: -travel, scale: desktop.matches ? 1.09 : 1.04 }, {
              yPercent: travel, ease: "none",
              scrollTrigger: {
                trigger: opening, start: "top bottom", end: "bottom top",
                scrub: true, invalidateOnRefresh: true,
              },
            });
          });
        }, root);
      }
      requestScrollRefresh();
    };
    configure();
    media.addEventListener("change", configure);
    desktop.addEventListener("change", configure);
    return () => {
      media.removeEventListener("change", configure);
      desktop.removeEventListener("change", configure);
      context?.revert();
    };
  }, []);

  function choose(id: SpaceId, button: HTMLButtonElement) {
    if (active) return;
    const opening = button.querySelector("[data-opening]")!;
    const image = opening.querySelector("img")!;
    const rect = opening.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    opener.current = button;
    setActive({
      id, scrollY: window.scrollY, source: image.currentSrc || image.src,
      left: rect.left, top: rect.top, width: rect.width, height: rect.height,
      naturalWidth: image.naturalWidth || 1536, naturalHeight: image.naturalHeight || 1024,
      position: window.getComputedStyle(image).objectPosition,
      previewScale: imageRect.width / rect.width,
      previewOffsetX: imageRect.left + imageRect.width / 2 - rect.left - rect.width / 2,
      previewOffsetY: imageRect.top + imageRect.height / 2 - rect.top - rect.height / 2,
    });
  }

  const finish = useCallback((enquire?: SpaceId) => {
    setActive(null);
    requestAnimationFrame(() => {
      if (enquire) {
        const world = spaceWorlds[enquire];
        window.dispatchEvent(new CustomEvent("vavi:application", { detail: { projectType: world.projectType, application: world.application } }));
        scrollToTarget("#enquiry", { onComplete: () => {
          document.querySelector<HTMLElement>("#enquiry input")?.focus({ preventScroll: true });
        } });
      } else opener.current?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <div ref={root} className={styles.experience} data-motion-owned="spaces" data-world={active?.id ?? "overview"}>
      <div className={styles.portals}>
        {portals.map((id, index) => {
          const item = spaceWorlds[id];
          return (
            <div key={index} className={`${styles.portalColumn} ${index === 1 ? styles.featured : ""}`}>
              <button className={styles.portal} onClick={(event) => choose(id, event.currentTarget)} aria-label={`Step inside: ${item.audience}`} aria-haspopup="dialog" aria-expanded={active?.id === id}>
                <span className={styles.portalTop}><span>{index === 2 ? "For Businesses" : item.audience}</span><span>Four interiors</span></span>
                <span className={styles.opening} data-opening>
                  <picture>
                  {item.scenes[0].mobileImage && <source media="(max-width: 767px)" srcSet={item.scenes[0].mobileImage} />}
                  <Image src={item.poster} alt={item.posterAlt} fill sizes="(max-width: 767px) 90vw, 36vw" onLoad={requestScrollRefresh} />
                  </picture>
                  <span className={styles.jamb} aria-hidden="true" />
                  <span className={styles.invite}>{active?.id === id ? "Opening…" : "Step inside"} <Arrow diagonal /></span>
                </span>
                <span className={styles.portalTitle}>{index === 0 ? <>A world<br /><em>of your own.</em></> : index === 1 ? <>Space for<br /><em>your vision.</em></> : <>A sense<br /><em>of identity.</em></>}</span>
                <span className={styles.portalDescription}>{index === 2 ? "A space that expresses who you are." : item.invitation}</span>
              </button>
              {index === 2 && (
                <div className={styles.destinations} aria-label="Business destination">
                  <button aria-label="Hospitality & Hotels" aria-pressed={business === "hospitality"} onClick={() => setBusiness("hospitality")}>Hospitality & Hotels</button>
                  <button aria-label="Offices & Workspaces" aria-pressed={business === "workspace"} onClick={() => setBusiness("workspace")}>Offices & Workspaces</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className={styles.overviewCaption}>Choose a starting point. Discover where it takes you.</p>
      <noscript><p className={styles.noScript}>To discuss any of these spaces, <a href="#enquiry">tell us about your project</a>.</p></noscript>
      {active && createPortal(<Suspense fallback={null}><SpaceJourney origin={active} onClose={finish} /></Suspense>, document.body)}
    </div>
  );
}
