"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { getProductEnquiryHref, type BrochureProduct } from "@/lib/brochure-products";
import { interiorRooms, type InteriorEnvironment } from "@/lib/brochure-interiors";
import { lockPageScroll } from "@/lib/scroll";
import Arrow from "./Arrow";
import styles from "./BrochureInteriorViewer.module.css";

type Props = {
  product: BrochureProduct;
  returnFocus: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
};

const environments: InteriorEnvironment[] = ["home", "hotel", "office"];
type Surface = { x: number; y: number; width: number; height: number };
const MOBILE = "(max-width: 700px)";
function subscribeMobile(callback: () => void) {
  const media = matchMedia(MOBILE);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const mobileSnapshot = () => matchMedia(MOBILE).matches;
const serverSnapshot = () => false;

/** Preserve the catalogue artwork's proportions inside the architectural recess. */
function fitArtwork(product: BrochureProduct, room: { width: number; height: number; surface: Surface }): Surface {
  const available = room.surface;
  const ratio = product.textureWidth / product.textureHeight;
  const width = Math.min(available.width, available.height * room.height * ratio / room.width);
  const height = width * room.width / ratio / room.height;
  return { x: available.x + (available.width - width) / 2, y: available.y + (available.height - height) / 2, width, height };
}

function InteriorScene({ product, environment, zoom, compact, active, hasPrevious, onReady, onNavigate }: {
  product: BrochureProduct;
  environment: InteriorEnvironment;
  zoom: boolean;
  compact: boolean;
  active: boolean;
  hasPrevious: boolean;
  onReady: (environment: InteriorEnvironment) => void;
  onNavigate: (direction: 1 | -1) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const [loaded, setLoaded] = useState({ room: false, texture: false });
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const room = interiorRooms[environment];
  const roomImage = compact && room.mobile ? room.mobile : room;
  const original = environment === "home" ? product.originalInterior : undefined;
  const source = original ?? roomImage;
  const surface = fitArtwork(product, roomImage);
  const ready = loaded.room && (Boolean(original) || loaded.texture) && !failed;
  const focusX = original ? .5 : surface.x + surface.width / 2;
  const focusY = original ? .5 : surface.y + surface.height / 2;

  useEffect(() => {
    if (ready && active) onReady(environment);
  }, [active, environment, onReady, ready]);

  useEffect(() => {
    if (ready || failed) return;
    const timeout = window.setTimeout(() => setFailed(true), 15000);
    return () => window.clearTimeout(timeout);
  }, [attempt, failed, ready]);

  useLayoutEffect(() => {
    const frame = viewport.current!;
    const artwork = canvas.current!;
    const resize = () => {
      const width = frame.clientWidth;
      const height = frame.clientHeight;
      if (!width || !height) return;
      // A mobile crop follows the selected surface, while retaining the complete
      // artwork and enough architecture around it to communicate the setting.
      const coverScale = Math.max(width / source.width, height / source.height);
      const maximumScale = original
        ? Math.min(width / source.width, height / source.height)
        : Math.min(width / (source.width * (surface.width + .12)), height / (source.height * (surface.height + .15)));
      const scale = Math.min(coverScale, maximumScale);
      const canvasWidth = source.width * scale;
      const canvasHeight = source.height * scale;
      const offset = (container: number, size: number, focus: number) => size <= container
        ? (container - size) / 2
        : Math.max(container - size, Math.min(0, container / 2 - size * focus));
      artwork.style.width = `${canvasWidth}px`;
      artwork.style.height = `${canvasHeight}px`;
      artwork.style.left = `${offset(width, canvasWidth, focusX)}px`;
      artwork.style.top = `${offset(height, canvasHeight, focusY)}px`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [focusX, focusY, original, source.width, source.height, surface.width, surface.height]);

  useEffect(() => {
    if (!ready || !active) return;
    // Warm just the next setting after this one is ready, rather than loading
    // every interior when the brochure opens.
    const next = environments[(environments.indexOf(environment) + 1) % environments.length];
    const nextRoom = interiorRooms[next];
    const nextSource = next === "home" && product.originalInterior ? product.originalInterior.src : compact && nextRoom.mobile ? nextRoom.mobile.src : nextRoom.src;
    const timer = window.setTimeout(() => {
      const image = new window.Image();
      image.fetchPriority = "low";
      image.src = nextSource;
    }, 500);
    return () => window.clearTimeout(timer);
  }, [active, compact, environment, product.originalInterior, ready]);

  function retry() {
    setLoaded({ room: false, texture: false });
    setFailed(false);
    setAttempt((value) => value + 1);
  }

  return (
    <div ref={viewport} className={styles.sceneViewport} data-environment={environment} data-ready={ready} aria-busy={!ready && !failed} aria-hidden={!active} inert={!active}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0 || event.target instanceof Element && event.target.closest("button, a")) return;
        pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { pointer.current = null; }}
      onPointerUp={(event) => {
        const start = pointer.current;
        pointer.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        if (!start || start.id !== event.pointerId) return;
        const distanceX = start.x - event.clientX;
        const distanceY = start.y - event.clientY;
        if (Math.abs(distanceX) > 45 && Math.abs(distanceX) > Math.abs(distanceY) * 1.3) onNavigate(distanceX > 0 ? 1 : -1);
      }}
    >
      <div className={styles.sceneVisual} data-ready={ready}>
        <div ref={canvas} className={styles.sceneCanvas} style={{ width: source.width, height: source.height, "--surface-focus": `${focusX * 100}% ${focusY * 100}%` } as CSSProperties}>
          <div className={styles.sceneArtwork} data-zoom={zoom}>
            <Image key={`room-${attempt}`} src={attempt ? `${source.src}?retry=${attempt}` : source.src}
              alt={original ? original.alt : `${room.title}, with ${product.name} from the ${product.collection} in the feature wall recess.`}
              width={source.width} height={source.height} className={styles.roomImage} unoptimized loading="eager" draggable={false}
              onLoad={() => setLoaded((state) => ({ ...state, room: true }))} onError={() => setFailed(true)} />
            {!original && <div className={styles.surface} style={{ left: `${surface.x * 100}%`, top: `${surface.y * 100}%`, width: `${surface.width * 100}%`, height: `${surface.height * 100}%` }}>
              <Image key={`texture-${attempt}`} src={attempt ? `${product.texture}?retry=${attempt}` : product.texture} alt={`${product.name} — original product artwork`}
                fill sizes="(max-width: 700px) 80vw, 45vw" unoptimized loading="eager" draggable={false}
                onLoad={() => setLoaded((state) => ({ ...state, texture: true }))} onError={() => setFailed(true)} />
            </div>}
          </div>
        </div>
      </div>
      {!ready && active && <div className={styles.imageStatus} data-overlay={hasPrevious} role="status">
        <span className={styles.statusRule} aria-hidden="true" />
        <p>{failed ? "This interior couldn’t load." : "Preparing your space…"}</p>
        {failed ? <button type="button" onClick={retry}>Try again <Arrow /></button> : <span>{product.name} · {room.label}</span>}
      </div>}
      <div className={styles.sceneCaption} hidden={!active || !ready && hasPrevious}>
        <span>{String(environments.indexOf(environment) + 1).padStart(2, "0")} / 03</span>
        <div><p>{original ? "A space from the collection" : room.title}</p><small>{original ? "Collection interior" : "Interior visualisation"}</small></div>
      </div>
    </div>
  );
}

function ProductArtwork({ product }: { product: BrochureProduct }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.detailArtwork}>
    {failed ? <p>The artwork couldn’t load. View it in the brochure below.</p>
      : <Image src={product.texture} alt={`${product.name}, artwork from the ${product.collection} brochure`} width={product.textureWidth} height={product.textureHeight} unoptimized sizes="350px" onError={() => setFailed(true)} />}
  </div>;
}

export default function BrochureInteriorViewer({ product, returnFocus, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const detailsButton = useRef<HTMLButtonElement>(null);
  const detailsClose = useRef<HTMLButtonElement>(null);
  const [environment, setEnvironment] = useState<InteriorEnvironment>("home");
  const [previousEnvironment, setPreviousEnvironment] = useState<InteriorEnvironment | null>(null);
  const [readyEnvironment, setReadyEnvironment] = useState<InteriorEnvironment | null>(null);
  const [zoom, setZoom] = useState(false);
  const [details, setDetails] = useState(false);
  const [closing, setClosing] = useState(false);
  const compact = useSyncExternalStore(subscribeMobile, mobileSnapshot, serverSnapshot);
  const id = useId();

  useEffect(() => {
    const element = dialog.current!;
    const trigger = returnFocus.current;
    const reader = element.parentElement?.closest("dialog");
    const unlock = lockPageScroll();
    // Stop wheel events here before they reach the reader's native page-turn
    // listener. React's delegated wheel handler would run too late.
    const isolateWheel = (event: WheelEvent) => event.stopPropagation();
    element.addEventListener("wheel", isolateWheel, { passive: true });
    element.showModal();
    if (trigger) {
      const origin = trigger.getBoundingClientRect();
      const bounds = element.getBoundingClientRect();
      element.style.transformOrigin = `${origin.left + origin.width / 2 - bounds.left}px ${origin.top + origin.height / 2 - bounds.top}px`;
    }
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      element.removeEventListener("wheel", isolateWheel);
      element.close();
      unlock();
      // A breakpoint change can remount the same page on the opposite side.
      const replacement = reader?.isConnected
        ? Array.from(reader.querySelectorAll<HTMLButtonElement>("button[data-brochure-product]")).find((button) => button.dataset.brochureProduct === product.id && !button.closest("[inert]"))
        : undefined;
      (trigger?.isConnected ? trigger : replacement)?.focus({ preventScroll: true });
    };
  }, [product.id, returnFocus]);

  useEffect(() => {
    if (details) detailsClose.current?.focus({ preventScroll: true });
  }, [details]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);

  useEffect(() => {
    if (!previousEnvironment) return;
    // Keep the last decoded room behind the arriving image, then release it
    // after the fade. A stalled request never retains an extra scene forever.
    const timer = window.setTimeout(() => setPreviousEnvironment(null), readyEnvironment === environment ? 550 : 15000);
    return () => window.clearTimeout(timer);
  }, [environment, previousEnvironment, readyEnvironment]);

  function chooseEnvironment(next: InteriorEnvironment) {
    if (next === environment) return;
    setPreviousEnvironment(readyEnvironment && readyEnvironment !== next ? readyEnvironment : null);
    setEnvironment(next);
    setZoom(false);
  }

  function navigate(direction: 1 | -1) {
    if (details) return;
    chooseEnvironment(environments[(environments.indexOf(environment) + direction + environments.length) % environments.length]);
  }

  function closeDetails() {
    setDetails(false);
    detailsButton.current?.focus({ preventScroll: true });
  }

  function escape() {
    if (details) closeDetails();
    else if (zoom) setZoom(false);
    else setClosing(true);
  }

  return (
    <dialog ref={dialog} className={styles.viewer} data-closing={closing} data-lenis-prevent aria-labelledby={`${id}-title`} aria-describedby={`${id}-instructions`}
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); escape(); }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") { event.preventDefault(); escape(); }
        if (!details && event.key === "ArrowRight") { event.preventDefault(); navigate(1); }
        if (!details && event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); }
      }}
    >
      <header className={styles.header}>
        <div className={styles.identity}><p>{product.collection}</p><h2 id={`${id}-title`}>{product.name}</h2></div>
        <div className={styles.environments} role="group" aria-label="Interior setting">
          {environments.map((setting) => <button type="button" key={setting} aria-pressed={environment === setting} onClick={() => chooseEnvironment(setting)}>{interiorRooms[setting].label}</button>)}
        </div>
        <button ref={closeButton} type="button" className={styles.close} aria-label="Close interior preview" onClick={() => setClosing(true)}><span>Back to brochure</span><span aria-hidden="true">×</span></button>
      </header>

      <div className={styles.stage}>
        <div inert={details} aria-hidden={details}>
          {[previousEnvironment, environment].filter((setting): setting is InteriorEnvironment => setting !== null).map((setting) => (
            <InteriorScene key={`${product.id}-${setting}-${setting === "home" && product.originalInterior ? "original" : compact ? "mobile" : "wide"}`}
              product={product} environment={setting} compact={compact} zoom={setting === environment && zoom} active={setting === environment}
              hasPrevious={previousEnvironment !== null} onReady={setReadyEnvironment} onNavigate={navigate} />
          ))}
          <div className={styles.viewMode} role="group" aria-label="View distance">
            <button type="button" aria-pressed={!zoom} onClick={() => setZoom(false)}>Room</button>
            <button type="button" aria-pressed={zoom} onClick={() => setZoom(true)}>Detail <span aria-hidden="true">+</span></button>
          </div>
          <button type="button" className={`${styles.sceneArrow} ${styles.previous}`} aria-label="Previous interior setting" onClick={() => navigate(-1)}><Arrow /></button>
          <button type="button" className={`${styles.sceneArrow} ${styles.next}`} aria-label="Next interior setting" onClick={() => navigate(1)}><Arrow /></button>
        </div>

        {details && <aside id={`${id}-details`} className={styles.details} aria-labelledby={`${id}-details-title`} data-lenis-prevent>
          <div className={styles.detailsHeading}><p>THE SELECTED SURFACE</p><button ref={detailsClose} type="button" aria-label="Close product details" onClick={closeDetails}>×</button></div>
          <h3 id={`${id}-details-title`}>{product.name}</h3>
          <p className={styles.detailCollection}>{product.collection}</p>
          <ProductArtwork key={product.id} product={product} />
          <p className={styles.artworkLabel}>Original product artwork</p>
          <p className={styles.description}>{product.description}</p>
          <dl className={styles.specifications}>
            {product.format && <div><dt>Format</dt><dd>{product.format}</dd></div>}
            {product.brochureId === "surface-studies" && <>
              {!product.format && <div><dt>Dimensions</dt><dd>To be confirmed</dd></div>}
              <div><dt>Finish</dt><dd>To be confirmed</dd></div>
            </>}
            <div><dt>Collection</dt><dd>{product.collection}</dd></div>
            <div><dt>In the brochure</dt><dd>Page {product.sourcePage}</dd></div>
          </dl>
          <a className={styles.sourceLink} href={`${product.sourcePdf}#page=${product.sourcePage}`} target="_blank" rel="noreferrer">View brochure page <Arrow diagonal /></a>
          <p className={styles.visualisationNote}>A decorative wall concept using the original artwork. Confirm dimensions and suitability for your project with the studio.</p>
        </aside>}
      </div>

      <footer className={styles.footer}>
        <button ref={detailsButton} className={styles.detailsButton} type="button" aria-expanded={details} aria-controls={`${id}-details`} onClick={() => { if (details) closeDetails(); else setDetails(true); }}>Product details <span aria-hidden="true">{details ? "−" : "+"}</span></button>
        <p id={`${id}-instructions`} className={styles.instructions}><span className={styles.desktopInstruction}>Use ← → to explore the settings</span><span className={styles.mobileInstruction}>Swipe to explore</span></p>
        <Link className={styles.enquire} href={getProductEnquiryHref(product, environment)}>Enquire about this tile <Arrow /></Link>
      </footer>
      <p className={styles.srOnly} role="status" aria-live="polite">{product.name}, {interiorRooms[environment].label} setting, {zoom ? "detail view" : "room view"}.</p>
    </dialog>
  );
}
