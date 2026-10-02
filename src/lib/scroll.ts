"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | undefined;
let mounted = false;
let pendingAnchor: string | null = null;
const locks = new Set<symbol>();
let restoreOverflow: (() => void) | undefined;

/** Geometry changes are batched, including fonts, images and expanding details. */
export function requestScrollRefresh() {
  if (typeof window === "undefined" || !mounted) return;
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    if (!lenis?.isScrolling) lenis?.resize();
    ScrollTrigger.refresh(true);
  }, 100);
}

export function scrollToTarget(
  target: number | string | HTMLElement,
  options: { immediate?: boolean; offset?: number; onComplete?: () => void } = {},
) {
  const node = typeof target === "string"
    ? document.getElementById(target.replace(/^#/, ""))
    : target;
  if (node === null) return;
  if (lenis) {
    // Fullscreen journeys replace document geometry before changing position.
    if (options.immediate) lenis.resize();
    lenis.scrollTo(node, { ...options, force: options.immediate, duration: .85 });
    return;
  }
  const top = typeof node === "number" ? node : node.getBoundingClientRect().top + window.scrollY
    - (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
    - (parseFloat(getComputedStyle(node).scrollMarginTop) || 0);
  window.scrollTo({ top: top + (options.offset ?? 0), behavior: "instant" });
  options.onComplete?.();
}

/** Every overlay releases only its own lock, including in reduced-motion mode. */
export function lockPageScroll(): () => void {
  const token = Symbol("page-scroll-lock");
  if (locks.size === 0) {
    const html = document.documentElement;
    const oldHtml = html.style.overflow;
    const oldGutter = html.style.scrollbarGutter;
    const hasScrollbarGutter = window.innerWidth > html.clientWidth;
    // Preserve an existing scrollbar's space without creating a new gutter on
    // overlay-scrollbar systems. Body overflow would break sticky sections.
    if (hasScrollbarGutter) html.style.scrollbarGutter = "stable";
    lenis?.stop();
    html.style.overflow = "hidden";
    restoreOverflow = () => {
      html.style.overflow = oldHtml;
      html.style.scrollbarGutter = oldGutter;
    };
  }
  locks.add(token);
  return () => {
    if (!locks.delete(token) || locks.size > 0) return;
    restoreOverflow?.();
    restoreOverflow = undefined;
    lenis?.resize();
    lenis?.start();
    requestScrollRefresh();
  };
}

export function syncScrollPosition() {
  // Next owns route and back/forward restoration; discard old-page inertia.
  lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
  requestScrollRefresh();
}

export function prepareRouteScroll() {
  // Native fragment positioning happens before client-only stories have their
  // final height. Keep the initial destination aligned until the visitor acts.
  pendingAnchor = window.location.hash || null;
  syncScrollPosition();
}

function focusAnchor(target: HTMLElement) {
  const temporary = !target.hasAttribute("tabindex") && !target.matches("a, button, input, select, textarea, summary");
  if (temporary) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  if (temporary) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
}

/** One document scroller and one clock, mounted by the root layout. */
export function mountPageScroll(): () => void {
  mounted = true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const tick = (time: number) => lenis?.raf(time * 1000);
  const configure = () => {
    gsap.ticker.remove(tick);
    // Settle native-scroll state before destroy: Lenis 1.3's pending velocity
    // timeout can otherwise reapply its root classes after a preference change.
    lenis?.stop();
    lenis?.destroy();
    lenis = null;
    if (!reduced.matches) {
      lenis = new Lenis({
        autoRaf: false,
        lerp: .14,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        stopInertiaOnNavigate: true,
        prevent: (node) => node.matches("textarea, select, [data-lenis-prevent]"),
      });
      lenis.on("scroll", ScrollTrigger.update);
      if (locks.size > 0) lenis.stop();
      gsap.ticker.add(tick);
    }
    document.documentElement.dataset.scrollMotion = reduced.matches ? "reduced" : "smooth";
    requestScrollRefresh();
  };
  gsap.ticker.lagSmoothing(0);
  configure();
  reduced.addEventListener("change", configure);

  const alignInitialAnchor = () => {
    if (!pendingAnchor || locks.size > 0) return;
    let target: HTMLElement | null;
    try { target = document.getElementById(decodeURIComponent(pendingAnchor.slice(1))); } catch { return; }
    if (target && !target.closest("[inert]")) scrollToTarget(target, { immediate: true });
  };
  const cancelInitialAnchor = () => { pendingAnchor = null; };
  ScrollTrigger.addEventListener("refresh", alignInitialAnchor);
  window.addEventListener("wheel", cancelInitialAnchor, { passive: true });
  window.addEventListener("touchstart", cancelInitialAnchor, { passive: true });
  window.addEventListener("pointerdown", cancelInitialAnchor, { passive: true });
  window.addEventListener("keydown", cancelInitialAnchor);

  let anchorFrame = 0;
  const onAnchor = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let id: string;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target || target.closest("[inert]")) return;
    event.preventDefault();
    // Let the mobile menu's React cleanup release its lock first.
    cancelAnimationFrame(anchorFrame);
    anchorFrame = requestAnimationFrame(() => {
      if (locks.size > 0) return;
      if (location.hash !== url.hash) history.pushState(history.state, "", url.hash);
      focusAnchor(target);
      scrollToTarget(target, { immediate: link.classList.contains("skip-link") });
    });
  };
  const onKey = (event: KeyboardEvent) => {
    if (["Tab", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
      // Native keyboard/focus scrolling must take over an unfinished wheel tween.
      lenis?.scrollTo(window.scrollY, { immediate: true });
    }
  };
  const onVisibility = () => {
    if (!document.hidden) syncScrollPosition();
  };
  let restorationFrame = 0;
  const onRestoration = () => {
    // Browser history restores native scroll after popstate dispatch finishes.
    cancelAnimationFrame(restorationFrame);
    restorationFrame = requestAnimationFrame(syncScrollPosition);
  };
  const onFocus = () => {
    // Form validation and other programmatic focus changes may scroll natively.
    if (lenis?.isScrolling === "smooth") lenis.scrollTo(window.scrollY, { immediate: true });
  };
  const observer = new ResizeObserver(requestScrollRefresh);
  observer.observe(document.body);
  document.addEventListener("click", onAnchor);
  document.addEventListener("keydown", onKey);
  document.addEventListener("focusin", onFocus);
  document.addEventListener("load", requestScrollRefresh, true);
  document.addEventListener("toggle", requestScrollRefresh, true);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", onRestoration);
  window.addEventListener("popstate", onRestoration);
  window.addEventListener("hashchange", onRestoration);
  let disposed = false;
  void document.fonts.ready.then(() => { if (!disposed) requestScrollRefresh(); });

  return () => {
    disposed = true;
    mounted = false;
    clearTimeout(refreshTimer);
    cancelAnimationFrame(anchorFrame);
    cancelAnimationFrame(restorationFrame);
    observer.disconnect();
    reduced.removeEventListener("change", configure);
    pendingAnchor = null;
    ScrollTrigger.removeEventListener("refresh", alignInitialAnchor);
    window.removeEventListener("wheel", cancelInitialAnchor);
    window.removeEventListener("touchstart", cancelInitialAnchor);
    window.removeEventListener("pointerdown", cancelInitialAnchor);
    window.removeEventListener("keydown", cancelInitialAnchor);
    document.removeEventListener("click", onAnchor);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("focusin", onFocus);
    document.removeEventListener("load", requestScrollRefresh, true);
    document.removeEventListener("toggle", requestScrollRefresh, true);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pageshow", onRestoration);
    window.removeEventListener("popstate", onRestoration);
    window.removeEventListener("hashchange", onRestoration);
    gsap.ticker.remove(tick);
    lenis?.stop();
    lenis?.destroy();
    lenis = null;
    delete document.documentElement.dataset.scrollMotion;
  };
}
