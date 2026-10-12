"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import type { Brochure } from "@/lib/brochures";
import { getBrochureProduct, getBrochureProductHotspot, type BrochureProduct } from "@/lib/brochure-products";
import { getPageStrips, getSpread, getTurnPages, getMaxSpread, type BrochureSpread } from "@/lib/brochure-reader";
import { lockPageScroll } from "@/lib/scroll";
import { BookObject, type BookOrigin } from "./BrochureLibrary";
import Arrow from "./Arrow";
import styles from "./BrochureReader.module.css";

const BrochureInteriorViewer = dynamic(() => import("./BrochureInteriorViewer"), {
  loading: () => <p className={styles.interiorLoading} role="status">Preparing your space…</p>,
});

type Props = { brochure: Brochure; origin: BookOrigin; onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null> };
type Turn = { from: BrochureSpread; to: BrochureSpread; front: number | null; back: number | null; destination: number; direction: 1 | -1; rigid: boolean };
const COMPACT = "(max-width: 700px)";
const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeCompact(callback: () => void) { const media = matchMedia(COMPACT); media.addEventListener("change", callback); return () => media.removeEventListener("change", callback); }
function subscribeReduced(callback: () => void) { const media = matchMedia(REDUCED); media.addEventListener("change", callback); return () => media.removeEventListener("change", callback); }
const serverSnapshot = () => false;
const compactSnapshot = () => matchMedia(COMPACT).matches;
const reducedSnapshot = () => matchMedia(REDUCED).matches;

export default function BrochureReader(props: Props) {
  return props.brochure.status === "ready" ? <Reader key={props.brochure.id} {...props} /> : <UnavailableReader {...props} />;
}

function UnavailableReader({ brochure, onClose, returnFocus }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const trigger = returnFocus.current;
    const unlock = lockPageScroll();
    element.showModal();
    return () => { element.close(); unlock(); trigger?.focus({ preventScroll: true }); };
  }, [returnFocus]);
  return (
    <dialog ref={dialog} className={styles.unavailableDialog} aria-labelledby="unavailable-title" onCancel={(event) => { event.preventDefault(); onClose(); }} data-lenis-prevent>
      <p className={styles.smallLabel}>BROCHURE LIBRARY</p>
      <h2 id="unavailable-title">{brochure.title}</h2>
      <p>This brochure’s preview is currently unavailable. Please explore our other collections or contact the studio for a copy.</p>
      <div><button type="button" onClick={onClose}>Back to the library</button><Link href="/#enquiry">Contact the studio <Arrow /></Link></div>
    </dialog>
  );
}

type OpenProduct = (product: BrochureProduct, trigger: HTMLButtonElement) => void;

function PageImage({ brochure, index, side, onPreview, onSwipe }: { brochure: Brochure; index: number | null; side?: string; onPreview?: OpenProduct; onSwipe?: (direction: 1 | -1) => void }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressClick = useRef(false);
  const page = index === null ? null : brochure.pages[index];
  const product = index === null ? undefined : getBrochureProduct(brochure.id, index);
  const hotspot = product ? getBrochureProductHotspot(product, index!) : null;
  return (
    <div className={`${styles.paperPage} ${side === "left" ? styles.leftPaper : styles.rightPaper}`} data-page={index === null ? "endpaper" : index + 1}>
      {page ? failed ? (
        <div className={styles.pageError}><p>This page couldn’t load.</p><a href={`${brochure.pdf}#page=${index! + 1}`} target="_blank" rel="noreferrer">View the original PDF <Arrow /></a></div>
      ) : <>{!loaded && <span className={styles.pageLoading}>Loading page {index! + 1}…</span>}<Image key={page.src} src={page.src} alt={page.alt} fill unoptimized sizes="(max-width: 700px) 90vw, 45vw" loading="eager" draggable={false} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} /></> : (
        <div className={styles.endpaper}><span>VAVI</span><small>{side === "left" ? "The collection library" : "A new possibility awaits."}</small></div>
      )}
      <span className={styles.paperShade} />
      {product && hotspot && loaded && !failed && onPreview ? (
        <button
          type="button"
          className={styles.productHotspot}
          style={{ left: `${hotspot.x * 100}%`, top: `${hotspot.y * 100}%`, width: `${hotspot.width * 100}%`, height: `${hotspot.height * 100}%` }}
          aria-label={`View ${product.name} in a space`}
          data-brochure-product={product.id}
          aria-haspopup="dialog"
          onPointerDown={(event) => {
            suppressClick.current = false;
            if (!onSwipe || !event.isPrimary || event.button !== 0) return;
            gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { gesture.current = null; suppressClick.current = true; }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            const start = gesture.current;
            gesture.current = null;
            if (!start || start.id !== event.pointerId) return;
            const x = start.x - event.clientX; const y = start.y - event.clientY;
            const delta = Math.abs(x) > Math.abs(y) ? x : y;
            if (Math.abs(delta) > 40) { suppressClick.current = true; onSwipe?.(delta > 0 ? 1 : -1); }
          }}
          onClick={(event) => {
            if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
            onPreview(product, event.currentTarget);
          }}
        ><span>View in a space <span aria-hidden="true">↗</span></span></button>
      ) : null}
    </div>
  );
}

function TurningLeaf({ brochure, turn, compact, reduced, onComplete }: { brochure: Brochure; turn: Turn; compact: boolean; reduced: boolean; onComplete: () => void }) {
  const layer = useRef<HTMLDivElement>(null);
  const complete = useRef(onComplete);
  useLayoutEffect(() => { complete.current = onComplete; });

  useLayoutEffect(() => {
    const root = layer.current!;
    const bookOffset = root.closest<HTMLElement>("[data-book-offset]");
    const strips = Array.from(root.querySelectorAll<HTMLElement>("[data-strip]"));
    const shadow = root.querySelector<HTMLElement>("[data-turn-shadow]")!;
    const model = { progress: 0 };
    const render = () => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      const geometry = getPageStrips(model.progress, width, strips.length, turn.rigid, turn.direction);
      geometry.forEach((strip, i) => {
        const element = strips[i];
        element.style.width = `${strip.width + .65}px`;
        element.style.transform = `translate3d(${strip.x}px,0,${strip.z + 2}px) rotateY(${strip.angle}deg)`;
        const front = element.children[0] as HTMLElement;
        const back = element.children[1] as HTMLElement;
        front.style.backgroundSize = back.style.backgroundSize = `${width}px ${height}px`;
        front.style.backgroundPosition = `${-i * strip.width}px 0`;
        back.style.backgroundPosition = `${-(width - (i + 1) * strip.width)}px 0`;
        const light = Math.sin(model.progress * Math.PI);
        element.style.setProperty("--leaf-shade", `${light * (.025 + i / strips.length * .095)}`);
      });
      const lift = Math.sin(Math.PI * model.progress);
      shadow.style.opacity = `${lift * .28}`;
      shadow.style.transform = `scaleX(${.15 + lift * .85})`;
      if (bookOffset && !compact) {
        const start = turn.from.left === null ? -25 : 0;
        const end = turn.to.left === null ? -25 : 0;
        bookOffset.style.transform = `translateX(${start + (end - start) * model.progress}%)`;
      }
    };
    render();
    const tween = gsap.to(model, { progress: 1, duration: reduced ? .01 : turn.rigid ? .82 : .76, ease: "power2.inOut", onUpdate: render, onComplete: () => complete.current() });
    const observer = new ResizeObserver(render);
    observer.observe(root);
    return () => { tween.kill(); observer.disconnect(); };
  }, [turn, compact, reduced]);

  return (
    <div ref={layer} className={styles.turnLayer} aria-hidden="true" data-rigid={turn.rigid}>
      <div className={styles.turnShadow} data-turn-shadow />
      {Array.from({ length: turn.rigid ? 1 : 14 }, (_, index) => (
        <div key={index} className={styles.strip} data-strip>
          <div className={styles.stripFront} style={{ backgroundImage: turn.front === null ? undefined : `url("${brochure.pages[turn.front].src}")` }} />
          <div className={styles.stripBack} style={{ backgroundImage: turn.back === null ? undefined : `url("${brochure.pages[turn.back].src}")` }} />
        </div>
      ))}
    </div>
  );
}

function Reader({ brochure, origin, returnFocus, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const arena = useRef<HTMLDivElement>(null);
  const offset = useRef<HTMLDivElement>(null);
  const rightPage = useRef<HTMLDivElement>(null);
  const flight = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const overviewButton = useRef<HTMLButtonElement>(null);
  const overviewClose = useRef<HTMLButtonElement>(null);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const zoomPane = useRef<HTMLDivElement>(null);
  const productTrigger = useRef<HTMLButtonElement>(null);
  const entry = useRef<gsap.core.Timeline | null>(null);
  const entryFrame = useRef<number | null>(null);
  const openingToken = useRef(0);
  const closeTween = useRef<gsap.core.Tween | null>(null);
  const closing = useRef(false);
  const gesture = useRef({ time: 0, amount: 0, locked: false });
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);
  const [position, setPosition] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [opening, setOpening] = useState(true);
  const [overview, setOverview] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BrochureProduct | null>(null);
  const compact = useSyncExternalStore(subscribeCompact, compactSnapshot, serverSnapshot);
  const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, serverSnapshot);
  const spreadIndex = Math.ceil(position / 2);
  const spread = compact ? { left: null, right: position } : getSpread(brochure.pageCount, spreadIndex);
  const busy = opening || Boolean(turn);
  const atStart = position === 0;
  const atEnd = compact ? position >= brochure.pageCount - 1 : spreadIndex >= getMaxSpread(brochure.pageCount);

  const navigate = useCallback((direction: 1 | -1) => {
    if (opening || turn || selectedProduct || closing.current) return;
    if (compact) {
      const destination = position + direction;
      if (destination < 0 || destination >= brochure.pageCount) return;
      setTurn({ from: { left: null, right: position }, to: { left: null, right: destination }, front: direction === 1 ? position : destination, back: null, direction, destination, rigid: Math.min(position, destination) === 0 });
    } else {
      const next = getTurnPages(brochure.pageCount, Math.ceil(position / 2), direction);
      if (!next) return;
      setTurn({ ...next, from: getSpread(brochure.pageCount, Math.ceil(position / 2)), to: getSpread(brochure.pageCount, next.destination), destination: next.destination === 0 ? 0 : next.destination * 2 - 1, direction, rigid: position === 0 || next.destination === 0 });
    }
  }, [brochure.pageCount, compact, opening, position, turn, selectedProduct]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    entry.current?.kill();
    closeTween.current = gsap.to(dialog.current, { opacity: 0, duration: reduced ? 0 : .2, onComplete: onClose });
  }, [onClose, reduced]);

  useEffect(() => {
    const element = dialog.current!;
    const trigger = returnFocus.current;
    const unlock = lockPageScroll();
    element.showModal();
    closeButton.current?.focus({ preventScroll: true });
    const token = ++openingToken.current;
    let disposed = false;
    // Keep the cover visible until the first spread decodes. A bounded wait
    // still exposes the per-page loading/error state on a stalled connection.
    let readinessTimeout: ReturnType<typeof setTimeout>;
    const decoded = Promise.allSettled(brochure.pages.slice(0, 3).map((page) => {
      const image = new window.Image(); image.src = page.src; return image.decode();
    }));
    const pagesReady = Promise.race([decoded, new Promise<void>((resolve) => { readinessTimeout = setTimeout(resolve, 5000); })]);
    void pagesReady.then(() => clearTimeout(readinessTimeout));
    entryFrame.current = requestAnimationFrame(() => {
      entryFrame.current = null;
      const isCompact = matchMedia(COMPACT).matches;
      const isReduced = matchMedia(REDUCED).matches;
      const target = rightPage.current!.getBoundingClientRect();
      const object = flight.current!;
      gsap.set(object, { left: target.left, top: target.top, width: target.width, height: target.height, x: origin.left - target.left, y: origin.top - target.top, scaleX: origin.width / target.width, scaleY: origin.height / target.height, opacity: 1 });
      gsap.set(chrome.current, { opacity: isReduced ? 1 : 0 });
      const startReading = async () => {
        await pagesReady;
        if (disposed || openingToken.current !== token || closing.current) return;
        object.style.visibility = "hidden";
        arena.current!.style.visibility = "visible";
        setOpening(false);
        if (isReduced) { setPosition(1); return; }
        const initial = getTurnPages(brochure.pageCount, 0, 1)!;
        setTurn(isCompact
          ? { from: { left: null, right: 0 }, to: { left: null, right: 1 }, front: 0, back: null, destination: 1, direction: 1, rigid: true }
          : { ...initial, from: getSpread(brochure.pageCount, 0), to: getSpread(brochure.pageCount, 1), destination: 1, direction: 1, rigid: true });
      };
      entry.current = gsap.timeline().to(object, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: isReduced ? 0 : .58, ease: "power3.inOut", onComplete: () => { void startReading(); } }).to(chrome.current, { opacity: 1, duration: isReduced ? 0 : .35 }, isReduced ? 0 : .3);
    });
    return () => { disposed = true; clearTimeout(readinessTimeout); if (entryFrame.current !== null) cancelAnimationFrame(entryFrame.current); entry.current?.kill(); closeTween.current?.kill(); element.close(); unlock(); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); };
    // The opening is a single transaction; live media changes affect the reader below.
  }, [brochure, origin, returnFocus]);

  useEffect(() => {
    const media = matchMedia(COMPACT);
    const settleLayout = () => {
      if (closing.current) return;
      const destination = opening ? Math.min(1, brochure.pageCount - 1) : turn?.destination ?? position;
      if (opening || turn) {
        openingToken.current++;
        if (entryFrame.current !== null) {
          cancelAnimationFrame(entryFrame.current);
          entryFrame.current = null;
        }
        entry.current?.kill();
        if (flight.current) flight.current.style.visibility = "hidden";
        if (arena.current) arena.current.style.visibility = "visible";
        if (chrome.current) chrome.current.style.opacity = "1";
        setPosition(destination);
        setOpening(false);
        setTurn(null);
      }
      // A breakpoint change can interrupt an imperative spine-centering tween.
      if (offset.current) offset.current.style.transform = !media.matches && destination === 0 ? "translateX(-25%)" : "translateX(0)";
      gesture.current = { time: 0, amount: 0, locked: false };
      pointer.current = null;
    };
    media.addEventListener("change", settleLayout);
    return () => media.removeEventListener("change", settleLayout);
  }, [brochure.pageCount, opening, position, turn]);

  useEffect(() => {
    const first = Math.max(0, position - 2);
    brochure.pages.slice(first, position + 5).forEach((page) => { const image = new window.Image(); image.src = page.src; });
  }, [brochure, position]);

  useEffect(() => {
    const element = arena.current!;
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || zoom || overview || selectedProduct) return;
      event.preventDefault();
      const now = performance.now();
      const state = gesture.current;
      if (now - state.time > 180) { state.amount = 0; state.locked = false; }
      state.time = now;
      if (busy || state.locked) return;
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      state.amount += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 600 : 1);
      if (Math.abs(state.amount) > 34) { state.locked = true; navigate(state.amount > 0 ? 1 : -1); }
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [busy, navigate, overview, zoom, selectedProduct]);

  useEffect(() => { if (overview) overviewClose.current?.focus({ preventScroll: true }); }, [overview]);
  useEffect(() => { if (zoom) zoomPane.current?.focus({ preventScroll: true }); }, [zoom]);

  function closeZoom() {
    setZoom(false);
    zoomButton.current?.focus({ preventScroll: true });
  }

  const openProduct: OpenProduct = (product, trigger) => {
    if (busy) return;
    productTrigger.current = trigger;
    setSelectedProduct(product);
  };

  function jump(index: number) {
    if (busy) return;
    setPosition(Math.max(0, Math.min(brochure.pageCount - 1, index)));
    setOverview(false);
    setZoom(false);
    if (overview) overviewButton.current?.focus({ preventScroll: true });
  }

  const base = turn ? compact ? { left: null, right: turn.direction === 1 ? turn.to.right : turn.from.right } : { left: turn.direction === 1 ? turn.from.left : turn.to.left, right: turn.direction === 1 ? turn.to.right : turn.from.right } : spread;
  const pageLabel = spread.left === null ? `Page ${(spread.right ?? 0) + 1}` : spread.right === null ? `Page ${spread.left + 1}` : `Pages ${spread.left + 1}–${spread.right + 1}`;
  const readingIndex = compact ? position : spread.left ?? spread.right ?? 0;

  return (
    <dialog
      ref={dialog} className={styles.reader} data-compact={compact} data-lenis-prevent aria-labelledby="reader-title" aria-describedby="reader-instructions"
      onCancel={(event) => { event.preventDefault(); if (selectedProduct) setSelectedProduct(null); else if (overview) { setOverview(false); overviewButton.current?.focus(); } else if (zoom) closeZoom(); else close(); }}
      onKeyDown={(event) => {
        if (selectedProduct || event.defaultPrevented) return;
        if (event.target instanceof HTMLElement && event.target.matches("input, select, textarea")) return;
        if (zoom || overview) return;
        if (["ArrowRight", "ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && event.target === dialog.current)) { event.preventDefault(); navigate(1); }
        if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); navigate(-1); }
        if (event.key === "Home") { event.preventDefault(); jump(0); }
        if (event.key === "End") { event.preventDefault(); jump(brochure.pageCount - 1); }
      }}
    >
      <div ref={chrome} className={styles.chrome}>
        <header className={styles.readerHeader}>
          <div><p className={styles.smallLabel}>THE BROCHURE LIBRARY</p><h2 id="reader-title">{brochure.title}</h2></div>
          <div className={styles.headerActions}>
            <a className={styles.pdfLink} href={brochure.pdf} download>Download PDF <span aria-hidden="true">↓</span></a>
            <button ref={closeButton} className={styles.close} type="button" onClick={close} aria-label="Close brochure"><span className={styles.closeLabel}>Close</span><span aria-hidden="true">×</span></button>
          </div>
        </header>
        <footer className={styles.readerFooter}>
          <div className={styles.viewActions}>
            <button ref={overviewButton} type="button" onClick={() => { setOverview((value) => !value); setZoom(false); }} aria-expanded={overview} aria-controls="brochure-pages" disabled={busy}>All pages<span className={styles.gridIcon} aria-hidden="true">▦</span></button>
            <button ref={zoomButton} type="button" onClick={() => { if (zoom) closeZoom(); else setZoom(true); setOverview(false); }} aria-pressed={zoom} disabled={busy}>{zoom ? "Fit to screen" : "Zoom"}<span aria-hidden="true">{zoom ? "−" : "+"}</span></button>
          </div>
          <div className={styles.pagination}>
            <button className={styles.previous} type="button" aria-label="Previous page" disabled={atStart || busy} onClick={() => { setZoom(false); navigate(-1); }}><Arrow /></button>
            <label className={styles.pageSelect}><span className={styles.srOnly}>Go to page</span><select value={position} aria-label="Go to page" onChange={(event) => jump(Number(event.target.value))} disabled={busy}>{brochure.pages.map((_, index) => <option key={index} value={index}>Page {index + 1}</option>)}</select><span aria-hidden="true">{pageLabel} <span className={styles.totalPages}>/ {brochure.pageCount}</span></span></label>
            <button type="button" aria-label="Next page" disabled={atEnd || busy} onClick={() => { setZoom(false); navigate(1); }}><Arrow /></button>
          </div>
          <p id="reader-instructions" className={styles.instructions}>{zoom ? "Scroll to inspect" : compact ? "Swipe to turn a page" : "Scroll or use ← → to turn the pages"}</p>
        </footer>
      </div>

      <div ref={arena} className={styles.arena} inert={zoom || overview} style={{ "--page-ratio": brochure.width / brochure.height } as CSSProperties}
        onPointerDown={(event) => {
          if (zoom || overview || !event.isPrimary || event.button !== 0) return;
          if (event.target instanceof Element && event.target.closest("a, button, input, select, textarea")) return;
          pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => { if (pointer.current?.id === event.pointerId) pointer.current = null; }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          const start = pointer.current;
          if (start?.id !== event.pointerId) return;
          pointer.current = null;
          if (!start || zoom || overview) return;
          const x = start.x - event.clientX; const y = start.y - event.clientY;
          const delta = Math.abs(x) > Math.abs(y) ? x : y;
          if (Math.abs(delta) > 40) navigate(delta > 0 ? 1 : -1);
        }}
      >
        <div className={styles.bookViewport}>
          <div ref={offset} data-book-offset className={styles.bookOffset} style={{ transform: !compact && position === 0 ? "translateX(-25%)" : "translateX(0)" }}>
            <div className={styles.openBook} data-cover={atStart && !turn}>
              {!compact && <div className={styles.leftPage}><PageImage key={`left-${base.left}`} brochure={brochure} index={base.left} side="left" onPreview={busy ? undefined : openProduct} onSwipe={navigate} /></div>}
              <div className={styles.rightPage} ref={rightPage}><PageImage key={`right-${base.right}`} brochure={brochure} index={base.right} side="right" onPreview={busy ? undefined : openProduct} onSwipe={navigate} /></div>
              {!compact && <div className={styles.binding} />}
              {turn && <TurningLeaf brochure={brochure} turn={turn} compact={compact} reduced={reduced} onComplete={() => { setPosition(turn.destination); setTurn(null); }} />}
            </div>
          </div>
        </div>
      </div>
      <div ref={flight} className={styles.flyingCover} style={{ width: origin.width, height: origin.height }} aria-hidden="true"><BookObject brochure={brochure} flying /></div>
      {opening && <p className={styles.openingStatus}>Preparing your brochure…</p>}

      {overview && <aside id="brochure-pages" className={styles.overview} aria-label="All brochure pages" data-lenis-prevent>
        <div className={styles.overviewHeader}><h3>Find your page.</h3><button ref={overviewClose} type="button" aria-label="Close page overview" onClick={() => { setOverview(false); overviewButton.current?.focus(); }}>×</button></div>
        <div className={styles.thumbnailGrid}>{brochure.pages.map((page, index) => <button type="button" key={page.src} onClick={() => jump(index)} aria-label={`Open page ${index + 1}`} aria-current={index === readingIndex ? "page" : undefined}><Image src={page.thumbnail} alt={page.alt} width={brochure.width} height={brochure.height} unoptimized sizes="120px" loading="lazy" /><span>{String(index + 1).padStart(2, "0")}</span></button>)}</div>
      </aside>}
      {zoom && <div ref={zoomPane} className={styles.zoomPane} data-lenis-prevent tabIndex={0} aria-label="Enlarged brochure pages. Scroll to inspect."><div className={styles.zoomPages}>{[spread.left, spread.right].filter((index): index is number => index !== null).map((index) => <div key={index} className={styles.zoomPage} style={{ aspectRatio: brochure.pages[index].width / brochure.pages[index].height }}><PageImage brochure={brochure} index={index} onPreview={openProduct} /></div>)}</div></div>}
      {selectedProduct && <BrochureInteriorViewer product={selectedProduct} returnFocus={productTrigger} onClose={() => setSelectedProduct(null)} />}
      <p className={styles.srOnly} role="status" aria-live="polite">{opening ? "Opening brochure" : `${pageLabel} of ${brochure.pageCount}`}</p>
    </dialog>
  );
}
