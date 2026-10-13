"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import type { Brochure } from "@/lib/brochures";
import { getBrochureProduct, getBrochureProductHotspot, type BrochureProduct } from "@/lib/brochure-products";
import { getSpread, getMaxSpread } from "@/lib/brochure-reader";
import { lockPageScroll } from "@/lib/scroll";
import { BookObject, type BookOrigin } from "./BrochureLibrary";
import Arrow from "./Arrow";
import styles from "./BrochureReader.module.css";
import TurningLeaf from "./BrochureTurningLeaf";
import { useBrochureNavigation } from "./useBrochureNavigation";

const BrochureInteriorViewer = dynamic(() => import("./BrochureInteriorViewer"), {
  loading: () => <p className={styles.interiorLoading} role="status">Preparing your space…</p>,
});

type Props = { brochure: Brochure; origin: BookOrigin; onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null> };
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

function PageImage({ brochure, index, side, onPreview }: { brochure: Brochure; index: number | null; side?: string; onPreview?: OpenProduct }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const page = index === null ? null : brochure.pages[index];
  const product = index === null ? undefined : getBrochureProduct(brochure.id, index);
  const hotspot = product ? getBrochureProductHotspot(product, index!) : null;
  return (
    <div className={`${styles.paperPage} ${side === "left" ? styles.leftPaper : styles.rightPaper}`} data-page={index === null ? "endpaper" : index + 1}>
      {page ? failed ? (
        <div className={styles.pageError}><p>This page couldn’t load.</p><a href={`${brochure.pdf}#page=${index! + 1}`} target="_blank" rel="noreferrer">View the original PDF <Arrow /></a></div>
      ) : <>{!loaded && <span className={styles.pageLoading}>Loading page {index! + 1}…</span>}<Image key={page.src} src={page.src} alt={page.alt} fill unoptimized sizes="(max-width: 700px) 90vw, 45vw" loading="eager" decoding="sync" draggable={false} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} /></> : (
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
          onClick={(event) => onPreview(product, event.currentTarget)}
        ><span>View in a space <span aria-hidden="true">↗</span></span></button>
      ) : null}
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
  const [opening, setOpening] = useState(true);
  const [openingError, setOpeningError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [overview, setOverview] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BrochureProduct | null>(null);
  const desiredCompact = useSyncExternalStore(subscribeCompact, compactSnapshot, serverSnapshot);
  const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, serverSnapshot);
  const navigation = useBrochureNavigation(brochure, desiredCompact, reduced, arena, !opening && !selectedProduct && !isClosing);
  const { compact, position, transaction, request, finish, getCache } = navigation;
  const turn = transaction?.ready && !reduced ? transaction : null;
  const spreadIndex = Math.ceil(position / 2);
  const spread = compact ? { left: null, right: position } : getSpread(brochure.pageCount, spreadIndex);
  const busy = opening || Boolean(transaction);
  const atStart = position === 0;
  const atEnd = compact ? position >= brochure.pageCount - 1 : spreadIndex >= getMaxSpread(brochure.pageCount);

  const navigate = useCallback((direction: 1 | -1) => request(direction), [request]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setIsClosing(true);
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
    let started = false;
    let resizeObserver: ResizeObserver | undefined;
    // The cover remains visible for as long as decoding takes. Never trade
    // visual continuity for a timeout that exposes an empty page.
    const pagesReady = getCache().ensure([0]);
    void pagesReady.catch(() => { /* Handled by startReading after the flight. */ });
    entryFrame.current = requestAnimationFrame(() => {
      entryFrame.current = null;
      const isReduced = matchMedia(REDUCED).matches;
      const target = rightPage.current!.getBoundingClientRect();
      const object = flight.current!;
      gsap.set(object, { left: target.left, top: target.top, width: target.width, height: target.height, x: origin.left - target.left, y: origin.top - target.top, scaleX: origin.width / target.width, scaleY: origin.height / target.height, opacity: 1 });
      gsap.set(chrome.current, { opacity: isReduced ? 1 : 0 });
      const startReading = async () => {
        try {
          await pagesReady;
          await rightPage.current?.querySelector<HTMLImageElement>("img")?.decode();
        } catch {
          if (!disposed) setOpeningError(true);
          return;
        }
        if (disposed || started || openingToken.current !== token || closing.current) return;
        started = true;
        object.style.visibility = "hidden";
        arena.current!.style.visibility = "visible";
        setOpening(false);
        request(1, false, true);
      };
      entry.current = gsap.timeline().to(object, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: isReduced ? 0 : .58, ease: "power3.inOut", onComplete: () => { void startReading(); } }).to(chrome.current, { opacity: 1, duration: isReduced ? 0 : .35 }, isReduced ? 0 : .3);
      let previousTarget = target;
      resizeObserver = new ResizeObserver(() => {
        if (disposed || started || closing.current || !rightPage.current) return;
        const nextTarget = rightPage.current.getBoundingClientRect();
        if (nextTarget.width === previousTarget.width && nextTarget.height === previousTarget.height && nextTarget.left === previousTarget.left && nextTarget.top === previousTarget.top) return;
        previousTarget = nextTarget;
        const currentBounds = object.getBoundingClientRect();
        entry.current?.kill();
        gsap.set(object, { left: nextTarget.left, top: nextTarget.top, width: nextTarget.width, height: nextTarget.height, x: currentBounds.left - nextTarget.left, y: currentBounds.top - nextTarget.top, scaleX: currentBounds.width / nextTarget.width, scaleY: currentBounds.height / nextTarget.height });
        gsap.set(chrome.current, { opacity: 1 });
        entry.current = gsap.timeline().to(object, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: matchMedia(REDUCED).matches ? 0 : .24, ease: "power2.out", onComplete: () => { void startReading(); } });
      });
      resizeObserver.observe(arena.current!);
    });
    return () => { disposed = true; resizeObserver?.disconnect(); if (entryFrame.current !== null) cancelAnimationFrame(entryFrame.current); entry.current?.kill(); closeTween.current?.kill(); element.close(); unlock(); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); };
    // The opening is a single transaction; live media changes affect the reader below.
  }, [brochure, origin, returnFocus, getCache, request]);

  useLayoutEffect(() => {
    // Reset any imperative spine transform after an interrupted turn/resize.
    if (!turn && offset.current) offset.current.style.transform = !compact && position === 0 ? "translateX(-25%)" : "translateX(0)";
  }, [compact, position, turn]);

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
    navigation.jump(index);
    setOverview(false);
    setZoom(false);
    if (overview) overviewButton.current?.focus({ preventScroll: true });
  }

  const base = turn ? compact ? { left: null, right: turn.to.right } : { left: turn.direction === 1 ? turn.from.left : turn.to.left, right: turn.direction === 1 ? turn.to.right : turn.from.right } : spread;
  // Stable page keys preserve the same image nodes through preparation,
  // animation, and landing. Hidden destination surfaces decode in place.
  const surfaces = new Map<string, { index: number | null; side: "left" | "right" }>();
  for (const pages of [...(transaction ? [transaction.to, transaction.from] : []), spread]) {
    if (!compact || pages.left !== null) surfaces.set(pages.left === null ? "end-left" : `page-${pages.left}`, { index: pages.left, side: "left" });
    surfaces.set(pages.right === null ? "end-right" : `page-${pages.right}`, { index: pages.right, side: "right" });
  }
  const pageLabel = spread.left === null ? `Page ${(spread.right ?? 0) + 1}` : spread.right === null ? `Page ${spread.left + 1}` : `Pages ${spread.left + 1}–${spread.right + 1}`;
  const readingIndex = compact ? position : spread.left ?? spread.right ?? 0;

  return (
    <dialog
      ref={dialog} className={styles.reader} data-compact={compact} data-turn-state={transaction ? transaction.ready ? "turning" : "preparing" : "idle"} data-lenis-prevent aria-labelledby="reader-title" aria-describedby="reader-instructions"
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
            <button className={styles.previous} type="button" aria-label="Previous page" disabled={opening || (atStart && !transaction)} onClick={() => { setZoom(false); navigate(-1); }}><Arrow /></button>
            <label className={styles.pageSelect}><span className={styles.srOnly}>Go to page</span><select value={position} aria-label="Go to page" onChange={(event) => jump(Number(event.target.value))} disabled={busy}>{brochure.pages.map((_, index) => <option key={index} value={index}>Page {index + 1}</option>)}</select><span aria-hidden="true">{pageLabel} <span className={styles.totalPages}>/ {brochure.pageCount}</span></span></label>
            <button type="button" aria-label="Next page" disabled={opening || (atEnd && !transaction)} onClick={() => { setZoom(false); navigate(1); }}><Arrow /></button>
          </div>
          <p id="reader-instructions" className={styles.instructions}>{zoom ? "Scroll to inspect" : compact ? "Swipe to turn a page" : "Scroll or use ← → to turn the pages"}</p>
        </footer>
      </div>

      <div ref={arena} className={styles.arena} inert={zoom || overview} style={{ "--page-ratio": brochure.width / brochure.height } as CSSProperties}
        {...navigation.pointerHandlers}
      >
        <div className={styles.bookViewport}>
          <div ref={offset} data-book-offset className={styles.bookOffset} style={{ transform: !compact && position === 0 ? "translateX(-25%)" : "translateX(0)" }}>
            <div className={styles.openBook} data-cover={atStart && !turn}>
              {Array.from(surfaces, ([key, page]) => {
                const visible = page.index === base[page.side];
                return <div key={key} className={page.side === "left" ? styles.leftPage : styles.rightPage} ref={page.side === "right" && page.index === spread.right ? rightPage : undefined} data-page-surface={page.index === null ? "endpaper" : page.index + 1} data-visible={visible} aria-hidden={!visible} inert={!visible || busy} style={{ visibility: visible ? undefined : "hidden" }}>
                  <PageImage brochure={brochure} index={page.index} side={page.side} onPreview={busy ? undefined : openProduct} />
                </div>;
              })}
              {!compact && <div className={styles.binding} />}
              {turn && <TurningLeaf brochure={brochure} turn={turn} compact={compact} reduced={reduced} motion={turn.motion} onComplete={finish} />}
            </div>
          </div>
        </div>
      </div>
      <div ref={flight} className={styles.flyingCover} style={{ width: origin.width, height: origin.height }} aria-hidden="true"><BookObject brochure={brochure} flying /></div>
      {(opening || (transaction && !transaction.ready) || navigation.error) && <p className={styles.openingStatus} role="status">{openingError || navigation.error ? <>This page couldn’t load. {openingError ? <a href={brochure.pdf} target="_blank" rel="noreferrer">View the original PDF</a> : "Try turning again, or download the PDF."}</> : opening ? "Preparing your brochure…" : "Preparing your next page…"}</p>}

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
