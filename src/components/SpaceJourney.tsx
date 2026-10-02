"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journeyFrom, type SpaceId, type SpaceScene } from "@/lib/space-worlds";
import { lockPageScroll, requestScrollRefresh, scrollToTarget } from "@/lib/scroll";
import styles from "./SpaceJourney.module.css";

gsap.registerPlugin(ScrollTrigger);

export type JourneyOrigin = {
  id: SpaceId; scrollY: number; source: string; position: string;
  left: number; top: number; width: number; height: number;
  naturalWidth: number; naturalHeight: number; previewScale: number;
  previewOffsetX: number; previewOffsetY: number;
};

function SceneArtwork({ scene, first, onReady }: { scene: SpaceScene; first: boolean; onReady: () => void }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  return (
    <div className={styles.artwork} data-depth style={{ "--position": scene.position ?? "50% 50%", "--mobile-position": scene.mobilePosition ?? "50% 50%" } as CSSProperties}>
      <picture>
      {scene.mobileImage && <source media="(max-width: 767px)" srcSet={scene.mobileImage} />}
      <Image key={attempt} src={scene.image} alt={scene.alt} fill sizes="100vw" loading="eager" fetchPriority={first ? "high" : "auto"}
        className={styles.photograph} data-ready={status === "ready"}
        onLoad={() => { setStatus("ready"); requestScrollRefresh(); if (first) onReady(); }}
        onError={() => { setStatus("error"); if (first) onReady(); }} />
      </picture>
      {status !== "ready" && <div className={styles.imageStatus} role="status">
        <p>{status === "error" ? "This interior couldn’t load." : "Preparing this interior…"}</p>
        {status === "error" && <button onClick={() => { setStatus("loading"); setAttempt(attempt + 1); }}>Try again</button>}
      </div>}
    </div>
  );
}

export default function SpaceJourney({ origin, onClose }: { origin: JourneyOrigin; onClose: (enquire?: SpaceId) => void }) {
  const worlds = useMemo(() => journeyFrom(origin.id), [origin.id]);
  const scenes = useMemo(() => worlds.flatMap((world) => world.scenes.map((scene, localIndex) => ({ scene, world, localIndex }))), [worlds]);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const entry = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const entryBack = useRef<HTMLButtonElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const categoryTransition = useRef<gsap.core.Timeline | null>(null);
  const releaseCategoryScroll = useRef<(() => void) | null>(null);
  const begin = useRef<(() => void) | null>(null);
  const firstReady = useRef(false);
  const historyToken = useRef<string | null>(null);
  const closeAction = useRef<(enquire?: SpaceId) => void>(() => {});
  const [current, setCurrent] = useState(0);
  const [loadedScenes, setLoadedScenes] = useState(() => new Set([0, 1]));
  const currentItem = scenes[current];
  const ready = useCallback(() => { firstReady.current = true; begin.current?.(); }, []);

  useLayoutEffect(() => {
    const container = root.current!;
    const entryElement = entry.current!;
    container.dataset.phase = "entering";
    entryElement.hidden = false;
    gsap.set(entryElement, { opacity: 1 });
    gsap.set(stage.current, { opacity: 0 });
    const page = document.getElementById("top")!;
    const html = document.documentElement;
    const previousPageStyle = page.getAttribute("style");
    const previousInert = page.inert;
    const backgroundSiblings = Array.from(document.body.children).filter((node): node is HTMLElement => node instanceof HTMLElement && node !== container && !node.contains(container));
    const backgroundInert = backgroundSiblings.map((node) => node.inert);
    const previousBehavior = html.style.scrollBehavior;
    const previousPadding = html.style.scrollPaddingTop;
    const previousAnchor = html.style.overflowAnchor;
    const previousGutter = html.style.scrollbarGutter;
    const previousRestoration = history.scrollRestoration;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    const otherTriggers = ScrollTrigger.getAll();
    otherTriggers.forEach((item) => item.disable(false));
    html.style.scrollBehavior = "auto";
    html.style.scrollPaddingTop = "0px";
    html.style.overflowAnchor = "none";
    if (window.innerWidth > html.clientWidth) html.style.scrollbarGutter = "stable";
    history.scrollRestoration = "manual";
    // Keep the overview painted in its exact place behind the expanding photograph.
    Object.assign(page.style, { position: "fixed", top: `${-origin.scrollY}px`, left: "0", width: "100%" });
    page.inert = true;
    backgroundSiblings.forEach((node) => { node.inert = true; });
    stage.current!.inert = true;
    const releaseEntryScroll = lockPageScroll();
    let releaseExitScroll: (() => void) | undefined;
    scrollToTarget(0, { immediate: true });
    entryBack.current?.focus({ preventScroll: true });

    const layers = Array.from(container.querySelectorAll<HTMLElement>("[data-scene]"));
    const copies = layers.map((layer) => layer.querySelector<HTMLElement>("[data-copy]")!);
    const bars = Array.from(container.querySelectorAll<HTMLElement>("[data-progress]"));
    let activeIndex = -1;
    let entering = true;
    let animationDone = false;
    let leaving = false;
    let closeRequested = false;
    let progress = 0;
    let resizeProgress: number | null = null;
    let destination: SpaceId | undefined;
    let exitTween: gsap.core.Tween | undefined;
    const historyKey = historyToken.current ??= `spaces-${Date.now()}`;
    // Strict Mode replays effects; a journey owns exactly one history entry.
    if (history.state?.vaviJourney !== historyKey) history.pushState({ ...history.state, vaviJourney: historyKey }, "");

    const paint = (value: number) => {
      progress = value;
      const position = Math.min(value * scenes.length, scenes.length - 0.001);
      const index = Math.floor(position);
      const fraction = position - index;
      const next = Math.min(index + 1, scenes.length - 1);
      // Most of the scroll distance is stillness; only the final quarter dissolves.
      const mix = index === next ? 0 : Math.max(0, Math.min(1, (fraction - 0.72) / 0.28));
      const selected = mix >= 0.5 ? next : index;
      if (selected !== activeIndex && document.activeElement?.closest("[data-scene]")) back.current?.focus({ preventScroll: true });
      layers.forEach((layer, i) => {
        const opacity = media.matches ? Number(i === selected) : i === index ? 1 : i === next ? mix : 0;
        // The next opaque photograph reveals over the previous one: no dark dip.
        layer.style.opacity = String(opacity);
        layer.style.visibility = opacity > 0 ? "visible" : "hidden";
        layer.style.zIndex = i === next && next !== index ? "1" : "0";
        if (i === index || i === next) {
          const depth = layer.querySelector<HTMLElement>("[data-depth]");
          const travel = mobile.matches ? 0.6 : 2;
          if (depth) gsap.set(depth, { yPercent: media.matches ? 0 : i === index ? -fraction * travel : (1 - mix) * travel, scale: media.matches ? 1 : mobile.matches ? 1.02 : 1.06 });
          gsap.set(copies[i], { opacity: media.matches ? 1 : i === index ? 1 - mix : mix, y: media.matches || mobile.matches ? 0 : i === index ? -mix * 12 : (1 - mix) * 18 });
        }
      });
      bars.forEach((bar, i) => { bar.style.transform = `scaleX(${Math.max(0, Math.min(1, (position - i * 4) / 4))})`; });
      if (selected !== activeIndex) {
        activeIndex = selected;
        setCurrent(selected);
        setLoadedScenes((previous) => {
          const loaded = new Set(previous);
          for (let i = Math.max(0, selected - 1); i <= Math.min(scenes.length - 1, selected + 2); i++) loaded.add(i);
          return loaded;
        });
      }
    };

    const finishEntry = () => {
      if (!animationDone || !firstReady.current || !entering || leaving) return;
      entering = false;
      page.style.display = "none";
      container.dataset.phase = "exploring";
      stage.current!.inert = false;
      back.current?.focus({ preventScroll: true });
      releaseEntryScroll();
      scrollToTarget(0, { immediate: true });
      gsap.set(stage.current, { opacity: 1 });
      gsap.to(entry.current, { opacity: 0, duration: media.matches ? 0 : 0.3, onComplete: () => { if (entry.current) entry.current.hidden = true; } });
      trigger.current = ScrollTrigger.create({
        trigger: container, start: "top top", end: "bottom bottom", invalidateOnRefresh: true,
        onUpdate: (self) => { if (resizeProgress === null) paint(self.progress); },
        onRefresh: (self) => {
          if (resizeProgress !== null) {
            const restored = resizeProgress;
            resizeProgress = null;
            scrollToTarget(self.start + (self.end - self.start) * restored, { immediate: true });
            paint(restored);
          } else paint(self.progress);
        },
      });
      paint(0);
      requestScrollRefresh();
    };
    begin.current = finishEntry;

    const finishClose = () => {
      if (leaving) return;
      leaving = true;
      releaseExitScroll ??= lockPageScroll();
      entryTimeline.kill();
      categoryTransition.current?.kill();
      releaseCategoryScroll.current?.();
      releaseCategoryScroll.current = null;
      trigger.current?.kill();
      exitTween = gsap.to(container, { opacity: 0, duration: media.matches ? 0 : 0.28, onComplete: () => onClose(destination) });
    };
    const pop = () => { if (history.state?.vaviJourney !== historyKey) finishClose(); };
    window.addEventListener("popstate", pop);
    closeAction.current = (enquire) => {
      if (closeRequested) return;
      closeRequested = true;
      destination = enquire;
      trigger.current?.disable(false);
      if (history.state?.vaviJourney === historyKey) history.back();
      else finishClose();
    };

    // A clipped full-resolution image matches the preview's cover geometry,
    // then expands to the viewport without stretching the tile proportions.
    const width = html.clientWidth;
    const height = window.innerHeight;
    const cover = Math.max(width / origin.naturalWidth, height / origin.naturalHeight);
    const small = Math.max(origin.width / origin.naturalWidth, origin.height / origin.naturalHeight) * origin.previewScale;
    const scale = small / cover;
    const [px, py] = origin.position.split(" ").map((part) => parseFloat(part) / 100);
    const x = origin.left + origin.width / 2 + origin.previewOffsetX + (0.5 - px) * (origin.naturalWidth * small - origin.width * origin.previewScale) - width / 2 - (0.5 - px) * (origin.naturalWidth * cover - width) * scale;
    const y = origin.top + origin.height / 2 + origin.previewOffsetY + (0.5 - py) * (origin.naturalHeight * small - origin.height * origin.previewScale) - height / 2 - (0.5 - py) * (origin.naturalHeight * cover - height) * scale;
    const entryTimeline = gsap.timeline({ onComplete: () => { animationDone = true; finishEntry(); } });
    if (media.matches) {
      gsap.set(entry.current, { clipPath: "inset(0% 0% 0% 0%)" });
      animationDone = true;
      finishEntry();
    } else {
      entryTimeline.fromTo(entry.current, { clipPath: `inset(${origin.top}px ${width - origin.left - origin.width}px ${height - origin.top - origin.height}px ${origin.left}px)` }, { clipPath: "inset(0px 0px 0px 0px)", duration: mobile.matches ? 0.7 : 1.05, ease: "power3.inOut" }, 0)
        .fromTo(entry.current?.querySelector("img") ?? [], { x, y, scale }, { x: 0, y: 0, scale: 1, objectPosition: (mobile.matches ? scenes[0].scene.mobilePosition : scenes[0].scene.position) ?? "50% 50%", duration: mobile.matches ? 0.7 : 1.05, ease: "power3.inOut" }, 0);
    }
    const preference = () => {
      if (entering && media.matches) entryTimeline.progress(1);
      if (media.matches) categoryTransition.current?.progress(1);
      paint(progress);
    };
    const resize = () => {
      if (entering) entryTimeline.progress(1);
      else {
        resizeProgress ??= progress;
        requestScrollRefresh();
      }
    };
    media.addEventListener("change", preference);
    mobile.addEventListener("change", preference);
    window.addEventListener("resize", resize);

    return () => {
      begin.current = null;
      trigger.current?.kill();
      trigger.current = null;
      entryTimeline.kill();
      exitTween?.kill();
      categoryTransition.current?.kill();
      releaseCategoryScroll.current?.();
      releaseCategoryScroll.current = null;
      gsap.killTweensOf(entryElement);
      media.removeEventListener("change", preference);
      mobile.removeEventListener("change", preference);
      window.removeEventListener("resize", resize);
      window.removeEventListener("popstate", pop);
      if (previousPageStyle === null) page.removeAttribute("style");
      else page.setAttribute("style", previousPageStyle);
      page.inert = previousInert;
      backgroundSiblings.forEach((node, index) => { node.inert = backgroundInert[index]; });
      releaseEntryScroll();
      releaseExitScroll?.();
      html.style.scrollBehavior = previousBehavior;
      html.style.scrollPaddingTop = previousPadding;
      html.style.overflowAnchor = previousAnchor;
      html.style.scrollbarGutter = previousGutter;
      history.scrollRestoration = previousRestoration;
      const liveTriggers = new Set(ScrollTrigger.getAll());
      otherTriggers.forEach((item) => { if (liveTriggers.has(item)) item.enable(false, false); });
      // Restore all viewport geometry before synchronising the native and Lenis
      // positions; removing a temporary gutter afterwards can shift the page.
      scrollToTarget(origin.scrollY, { immediate: true });
      requestScrollRefresh();
    };
  }, [origin, scenes, onClose]);

  function goToCategory(index: number) {
    const scroll = trigger.current;
    if (!scroll) return;
    const jump = () => scrollToTarget(scroll.start + (scroll.end - scroll.start) * index / worlds.length, { immediate: true });
    setLoadedScenes((previous) => new Set([...previous, index * 4, index * 4 + 1]));
    categoryTransition.current?.kill();
    releaseCategoryScroll.current?.();
    releaseCategoryScroll.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      jump();
      gsap.set(stage.current, { opacity: 1 });
      return;
    }
    releaseCategoryScroll.current = lockPageScroll();
    categoryTransition.current = gsap.timeline({ onComplete: () => {
      releaseCategoryScroll.current?.();
      releaseCategoryScroll.current = null;
    } }).to(stage.current, { opacity: 0, duration: 0.16, onComplete: jump }).to(stage.current, { opacity: 1, duration: 0.35 });
  }

  return (
    <div ref={root} className={styles.journey} data-motion-owned="journey" data-phase="entering" role="dialog" aria-modal="true" aria-label="Made around you: an interior journey"
      onKeyDown={(event) => {
        if (event.key === "Escape") { event.preventDefault(); closeAction.current(); }
        if (event.key === "Tab") {
          const focusable = Array.from(root.current!.querySelectorAll<HTMLElement>("button, a[href]")).filter((element) => element.tabIndex >= 0 && !element.closest("[inert]") && element.getClientRects().length && getComputedStyle(element).visibility !== "hidden");
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <div ref={stage} className={styles.stage}>
        <div className={styles.scenes}>
          {scenes.map(({ scene, world, localIndex }, index) => (
            <article key={scene.image} className={styles.scene} data-scene={index} aria-hidden={current !== index} inert={current !== index} aria-labelledby={`journey-scene-${index}`}>
              {loadedScenes.has(index) && <SceneArtwork scene={scene} first={index === 0} onReady={ready} />}
              <div className={styles.shade} />
              <div className={`${styles.copy} ${localIndex === 0 ? styles.chapterCopy : ""}`} data-copy>
                <p className={styles.room}>{scene.room}</p>
                <h2 id={`journey-scene-${index}`}>{localIndex === 0 ? world.chapter : scene.title}</h2>
                {localIndex === 3 && <button className={styles.enquiry} onClick={() => closeAction.current(world.id)}>{index === scenes.length - 1 ? "Your space comes next" : world.cta}<span aria-hidden="true">↗</span></button>}
              </div>
            </article>
          ))}
        </div>
        <div className={styles.toolbar}>
          <button ref={back} className={styles.back} onClick={() => closeAction.current()}><span aria-hidden="true">←</span> Back to spaces</button>
          <p className={styles.signature}>Made around you</p>
          <p className={styles.location}>{currentItem.world.label}<span>{String(currentItem.localIndex + 1).padStart(2, "0")} / 04</span></p>
        </div>
        <footer className={styles.footer}>
          <nav className={styles.chapters} aria-label="Journey categories">
            {worlds.map((world, index) => <button key={world.id} aria-current={currentItem.world.id === world.id ? "step" : undefined} onClick={() => goToCategory(index)}>
              <span className={styles.progress}><span data-progress /></span><span>{world.label}</span>
            </button>)}
          </nav>
          <p className={styles.disclosure}>Interior concepts</p>
        </footer>
      </div>
      <div ref={entry} className={styles.entry} aria-hidden="true"><Image src={origin.source} alt="" fill unoptimized loading="eager" style={{ objectFit: "cover", objectPosition: origin.position }} /></div>
      <button ref={entryBack} className={styles.entryBack} onClick={() => closeAction.current()}><span aria-hidden="true">←</span> Back to spaces</button>
      <p className={styles.srOnly} role="status" aria-live="polite">{currentItem.world.audience}. {currentItem.scene.room}. Interior {currentItem.localIndex + 1} of 4.</p>
    </div>
  );
}
