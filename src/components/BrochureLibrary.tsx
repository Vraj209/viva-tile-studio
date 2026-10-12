"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Arrow from "./Arrow";
import { brochures, type Brochure } from "@/lib/brochures";
import styles from "./BrochureLibrary.module.css";

const loadReader = () => import("./BrochureReader");
const BrochureReader = dynamic(loadReader, { ssr: false });

export type BookOrigin = { left: number; top: number; width: number; height: number };

export function BookObject({ brochure, flying = false }: { brochure: Brochure; flying?: boolean }) {
  return (
    <span className={`${styles.bookObject} ${flying ? styles.flyingBook : ""}`}>
      <span className={styles.bookBack} />
      <span className={styles.pageEdges} />
      <span className={styles.bookSpine} />
      <span className={styles.bookCover}>
        {brochure.cover ? (
          <Image src={brochure.cover} alt={`${brochure.title} original brochure cover`} fill unoptimized sizes="(max-width: 700px) 72vw, 30vw" loading="eager" draggable={false} />
        ) : (
          <span className={styles.unavailableCover}>
            <span>ETON</span>
            <strong>{brochure.title}</strong>
            <span>Preview unavailable</span>
          </span>
        )}
        <span className={styles.coverLight} />
      </span>
    </span>
  );
}

export default function BrochureLibrary() {
  const [selected, setSelected] = useState<{ brochure: Brochure; origin: BookOrigin } | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  function open(brochure: Brochure, button: HTMLButtonElement) {
    const cover = button.querySelector<HTMLElement>("[data-book-origin]");
    if (!cover) return;
    const { left, top, width, height } = cover.getBoundingClientRect();
    trigger.current = button;
    setSelected({ brochure, origin: { left, top, width, height } });
  }

  return (
    <>
      <section className={styles.library} data-reader-open={Boolean(selected)} aria-labelledby="brochures-heading">
        <header className={styles.intro} data-motion="hero">
          <p className={styles.eyebrow} data-motion-item>THE BROCHURE LIBRARY</p>
          <h1 id="brochures-heading" data-motion-item>Inspiration, <em>bound.</em></h1>
          <p className={styles.description} data-motion-item>A closer look at the surfaces that shape a space. Open a collection and find your next possibility.</p>
        </header>

        <div className={styles.shelf}>
          {brochures.map((brochure, index) => (
            <article key={brochure.id} className={styles.edition} style={{ "--book-ratio": brochure.width / brochure.height, "--edition": index } as CSSProperties}>
              <button
                type="button"
                className={styles.bookButton}
                onClick={(event) => open(brochure, event.currentTarget)}
                onPointerEnter={() => { if (brochure.status === "ready") void loadReader(); }}
                onFocus={() => { void loadReader(); }}
                aria-label={brochure.status === "ready" ? `Explore ${brochure.title} brochure` : `${brochure.title}: preview unavailable`}
                data-selected={selected?.brochure.id === brochure.id}
              >
                <span className={styles.bookStage}>
                  <span className={styles.bookGround} />
                  <span className={styles.bookPlacement} data-book-origin>
                    <BookObject brochure={brochure} />
                  </span>
                </span>
                <span className={styles.caption}>
                  <span className={styles.editionDetails}>{brochure.format}<span>{brochure.pageCount} pages</span></span>
                  <span className={styles.title}>{brochure.title}</span>
                  <span className={styles.subtitle}>{brochure.subtitle}</span>
                  <span className={styles.explore}>{brochure.status === "ready" ? "Explore brochure" : "Preview unavailable"}<Arrow /></span>
                </span>
              </button>
              {brochure.status === "ready" && <a className={styles.download} href={brochure.pdf} download aria-label={`Download ${brochure.title} PDF`}>Download PDF</a>}
            </article>
          ))}
        </div>

        <div className={styles.libraryNote}>
          <p>From the first impression<br /><em>to the finer details.</em></p>
          <span>Original collections. Every page, at your own pace.</span>
        </div>
      </section>
      {selected && <BrochureReader brochure={selected.brochure} origin={selected.origin} returnFocus={trigger} onClose={() => setSelected(null)} />}
    </>
  );
}
