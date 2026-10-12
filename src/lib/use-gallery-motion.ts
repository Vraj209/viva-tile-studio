"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

type Controller = {
  select: (index: number) => void;
  configure: (still: boolean, inspecting: boolean) => void;
};

/** Scroll, buttons and dragging share the original GSAP position and renderer.
 * Page interpolation belongs to the global Lenis clock; this section only paints
 * its progress and supplies the existing sticky runway. */
export function useGalleryMotion(
  stageRef: RefObject<HTMLDivElement | null>,
  trackRef: RefObject<HTMLDivElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
  count: number,
  onSelect: (index: number) => void,
  still = false,
  inspecting = false,
) {
  const controller = useRef<Controller | null>(null);
  const selectedRef = useRef(0);
  const suppressClick = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    const panel = panelRef.current;
    if (!stage || !track || !panel) return;
    const samples = [...stage.querySelectorAll<HTMLButtonElement>("[data-gallery-sample]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let manualStill = false;
    let suspended = false;
    const isStill = () => manualStill || reduced.matches;
    const position = { value: selectedRef.current, opacity: 1 };
    let width = stage.clientWidth;
    let tween: gsap.core.Tween | undefined;
    let trigger: ScrollTrigger | undefined;
    let resetClick: ReturnType<typeof setTimeout> | undefined;
    let readyFrame = 0;
    let disposed = false;
    let layoutReady = false;
    let measured = false;
    let refreshing = false;
    let pinned = false;
    let distance = 0;
    let trackStart = 0;
    let stickyTop = 0;
    let scrollEnd = count - 1;
    let anchor: { progress: number; value: number } | null = null;
    let gesture: { id: number; x: number; y: number; origin: number; dragging: boolean } | null = null;

    const commit = (index: number) => {
      if (index === selectedRef.current) return;
      selectedRef.current = index;
      onSelect(index);
    };
    const paint = () => {
      const mobile = width < 550;
      const spacing = width * (mobile ? 0.72 : 0.3);
      samples.forEach((sample, index) => {
        const offset = index - position.value;
        const distance = Math.abs(offset);
        gsap.set(sample, {
          xPercent: -50, yPercent: -50,
          x: isStill() ? 0 : offset * spacing,
          y: isStill() ? 0 : -offset * (mobile ? -27 : 65),
          rotationX: isStill() ? 0 : 7,
          rotationY: isStill() ? 0 : -16 - Math.min(2, Math.max(-2, offset)) * 4,
          rotationZ: isStill() ? 0 : -8,
          scale: isStill() ? 1 : Math.max(0.48, 1 - distance * (mobile ? .43 : .28)),
          opacity: (distance < .05 ? 1 : Math.max(0, 1 - distance * .32)) * position.opacity,
          visibility: distance > 2.05 || (isStill() && distance > .5) ? "hidden" : "visible",
          zIndex: Math.round(10 - distance * 2),
        });
      });
      stage.dataset.galleryPosition = position.value.toFixed(4);
    };
    const context = gsap.context(() => paint(), stage);
    const stop = () => { tween?.kill(); tween = undefined; };
    const rebase = () => {
      anchor = { progress: trigger?.progress ?? 0, value: position.value };
    };
    const scrollValue = (progress: number) => {
      if (!anchor) return progress * scrollEnd;
      // A direct selection becomes the current moment without moving the page.
      // Both directions still converge on the sequence's original endpoints.
      if (progress < anchor.progress) return anchor.value * progress / anchor.progress;
      if (progress > anchor.progress) {
        const end = Math.max(scrollEnd, anchor.value);
        return anchor.value + (end - anchor.value) * (progress - anchor.progress) / (1 - anchor.progress);
      }
      return anchor.value;
    };
    const followScroll = (self: ScrollTrigger) => {
      if (isStill() || suspended || refreshing || gesture?.dragging) return;
      if (tween) {
        // A wheel gesture can interrupt a manual choice before it settles. Use
        // the currently painted pose, rather than jumping to its destination.
        anchor = { progress: anchor?.progress ?? self.progress, value: position.value };
      }
      tween?.kill();
      tween = undefined;
      position.opacity = 1;
      // Lenis has already eased the document position. A second scrub tween here
      // would trail the page and continue moving after the visitor has stopped.
      position.value = scrollValue(self.progress);
      commit(Math.round(position.value));
      paint();
    };
    const settle = (index: number) => {
      layoutReady = true;
      stop();
      commit(index);
      anchor = { progress: trigger?.progress ?? 0, value: index };
      if (isStill()) {
        position.value = index;
        position.opacity = 1;
        paint();
        return;
      }
      if (Math.abs(index - position.value) > 1.1) {
        // Preserve the existing fade for distant manual choices.
        position.value = index;
        position.opacity = 0;
        paint();
        tween = gsap.to(position, { opacity: 1, duration: .35, ease: "power2.out", onUpdate: paint });
        return;
      }
      position.opacity = 1;
      paint();
      tween = gsap.to(position, { value: index, duration: .85, ease: "power3.out", onUpdate: paint });
    };

    const measure = () => {
      width = stage.clientWidth;
      // Share the CSS offset so the gallery remains below the sticky header.
      stickyTop = parseFloat(getComputedStyle(panel).top) || 0;
      const panelHeight = panel.offsetHeight;
      const compositionHeight = stage.getBoundingClientRect().bottom - panel.getBoundingClientRect().top;
      const canPin = compositionHeight <= window.innerHeight - stickyTop - 24;
      const mobile = window.innerWidth <= 768;
      const start = track.getBoundingClientRect().top + window.scrollY - stickyTop;
      if (isStill() || !canPin) {
        // Retain only already-travelled space when motion is disabled mid-pin.
        // Collapsing that space would jump the content underneath the visitor.
        distance = distance > 0
          ? Math.max(0, Math.min(distance, Math.max(0, window.scrollY - trackStart)) + trackStart - start)
          : 0;
        if (!isStill()) pinned = false;
      } else {
        pinned = canPin;
        const step = mobile ? 120 : 240;
        const bounds = panel.getBoundingClientRect();
        const viewing = layoutReady && measured && bounds.top >= stickyTop - 2 && bounds.top <= stickyTop + 1 && bounds.bottom > stickyTop;
        // A resize can reflow earlier sections and shift native scroll anchoring.
        // Keep enough remaining travel so a restored pin never rushes to its end.
        distance = Math.max((count - 1) * step, viewing
          ? Math.max(0, window.scrollY - start) + (count - 1 - position.value) * step
          : 0);
      }
      trackStart = start;
      scrollEnd = pinned ? count - 1 : Math.min(3, count - 1);
      track.style.setProperty("--gallery-panel-height", `${panelHeight}px`);
      track.style.setProperty("--gallery-scroll-distance", `${distance}px`);
      track.dataset.scrollMode = isStill() ? "still" : pinned ? "pinned" : "inline";
      paint();
    };
    measure();
    trigger = ScrollTrigger.create({
      id: "inspiration-gallery",
      trigger: track,
      start: () => pinned ? `top ${stickyTop}px` : `${distance + stage.offsetTop} 42%`,
      end: () => `+=${Math.max(distance, window.innerHeight * .3, 120)}`,
      onUpdate: followScroll,
      onRefreshInit: () => { refreshing = true; measure(); },
      onRefresh: (self) => {
        // Hold the current pose while refreshed bounds update scroll progress.
        // A local refresh can still expose the old self.progress until its next
        // update. Anchor to the new bounds and the actual document position.
        const progress = gsap.utils.clamp(0, 1, (window.scrollY - self.start) / (self.end - self.start));
        if (measured && layoutReady) {
          // Font, viewport and upstream section changes must not restart a pose.
          // Image loads elsewhere should not interrupt a manual selection tween.
          anchor = { progress, value: tween ? selectedRef.current : position.value };
        } else if (!isStill()) {
          anchor = null;
          position.value = progress * scrollEnd;
          commit(Math.round(position.value));
          paint();
        }
        measured = true;
        refreshing = false;
        track.dataset.galleryScrollStart = String(self.start);
        track.dataset.galleryScrollEnd = String(self.end);
      },
    });
    const observer = new ResizeObserver(requestScrollRefresh);
    observer.observe(panel);
    // Global scroll infrastructure observes upstream layout and image changes.
    // Warm the small browse faces before fast scrubbing can reveal distant tiles.
    // Full inspection photographs remain lazy and unmounted until requested.
    const nearby = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      stage.querySelectorAll("img").forEach((image) => { image.loading = "eager"; });
      nearby.disconnect();
    }, { rootMargin: "100% 0px" });
    nearby.observe(track);
    // Let initial font/hydration layout and browser scroll restoration settle
    // before retaining poses across later responsive refreshes.
    const ready = () => {
      document.fonts.ready.then(() => {
        if (disposed) return;
        readyFrame = requestAnimationFrame(() => {
          readyFrame = requestAnimationFrame(() => {
            trigger?.refresh();
            layoutReady = true;
          });
        });
      });
    };
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready, { once: true });
    const configure = (nextStill: boolean, nextSuspended: boolean) => {
      const changed = manualStill !== nextStill;
      if (!changed && suspended === nextSuspended) return;
      if (changed || suspended !== nextSuspended) stop();
      manualStill = nextStill;
      suspended = nextSuspended;
      if (isStill()) position.value = selectedRef.current;
      position.opacity = 1;
      rebase();
      paint();
      if (changed) requestScrollRefresh();
    };
    controller.current = { select: settle, configure };
    const onMotionChange = () => {
      stop();
      position.value = selectedRef.current;
      position.opacity = 1;
      rebase();
      paint();
      requestScrollRefresh();
    };
    reduced.addEventListener("change", onMotionChange);

    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || suspended) return;
      if (resetClick) clearTimeout(resetClick);
      suppressClick.current = false;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: position.value, dragging: false };
    };
    const move = (event: PointerEvent) => {
      if (!gesture || event.pointerId !== gesture.id) return;
      if (event.buttons === 0) { finish(event, true); return; }
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.dragging) {
        if (Math.abs(dy) > 9 && Math.abs(dy) > Math.abs(dx)) { gesture = null; return; }
        if (Math.abs(dx) < 9 || Math.abs(dx) < Math.abs(dy)) return;
        gesture.dragging = true;
        suppressClick.current = true;
        stage.setPointerCapture(event.pointerId);
        stage.dataset.dragging = "true";
        stop();
        position.opacity = 1;
      }
      const delta = Math.max(-1, Math.min(1, -dx / Math.max(150, width * .3)));
      position.value = Math.max(0, Math.min(count - 1, gesture.origin + delta));
      if (!isStill()) paint();
    };
    const finish = (event: PointerEvent, canceled = event.type === "pointercancel") => {
      if (!gesture || event.pointerId !== gesture.id) return;
      const wasDragging = gesture.dragging;
      gesture = null;
      delete stage.dataset.dragging;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      if (wasDragging) {
        settle(canceled ? selectedRef.current : Math.round(position.value));
        resetClick = setTimeout(() => { suppressClick.current = false; }, 0);
      }
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", finish);
    stage.addEventListener("pointercancel", finish);
    return () => {
      disposed = true;
      stop();
      trigger?.kill();
      trigger = undefined;
      cancelAnimationFrame(readyFrame);
      window.removeEventListener("load", ready);
      if (resetClick) clearTimeout(resetClick);
      observer.disconnect();
      nearby.disconnect();
      reduced.removeEventListener("change", onMotionChange);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", finish);
      stage.removeEventListener("pointercancel", finish);
      if (gesture && stage.hasPointerCapture(gesture.id)) stage.releasePointerCapture(gesture.id);
      delete stage.dataset.dragging;
      delete stage.dataset.galleryPosition;
      delete track.dataset.scrollMode;
      delete track.dataset.galleryScrollStart;
      delete track.dataset.galleryScrollEnd;
      track.style.removeProperty("--gallery-panel-height");
      track.style.removeProperty("--gallery-scroll-distance");
      controller.current = null;
      context.revert();
      gsap.set(samples, { clearProps: "transform,opacity,visibility,zIndex" });
    };
  }, [stageRef, trackRef, panelRef, count, onSelect]);

  useEffect(() => { controller.current?.configure(still, inspecting); }, [still, inspecting]);
  const select = useCallback((index: number) => {
    controller.current?.select(Math.max(0, Math.min(count - 1, index)));
  }, [count]);

  return { select, suppressClick };
}
