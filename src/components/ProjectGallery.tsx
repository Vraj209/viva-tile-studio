"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { galleryAssets } from "@/lib/gallery-assets";
import { useGalleryMotion } from "@/lib/use-gallery-motion";
import Arrow from "./Arrow";
import { GalleryInspection } from "./GalleryInspection";
import styles from "./ProjectGallery.module.css";

const number = (index: number) => String(index + 1).padStart(2, "0");

export default function ProjectGallery() {
  const [selected, setSelected] = useState(0);
  const [inspectionIndex, setInspectionIndex] = useState<number | null>(null);
  const [still, setStill] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const sampleButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const pendingFocus = useRef<number | null>(null);
  const active = galleryAssets[selected];
  const commitSelection = useCallback((index: number) => {
    setSelected(Math.max(0, Math.min(galleryAssets.length - 1, index)));
  }, []);
  const { select, suppressClick } = useGalleryMotion(
    stage, track, panel, galleryAssets.length, commitSelection, still, inspectionIndex !== null,
  );

  useEffect(() => {
    if (pendingFocus.current === null) return;
    // The motion hook has made the committed selection visible before focusing.
    sampleButtons.current[pendingFocus.current]?.focus({ preventScroll: true });
    pendingFocus.current = null;
  }, [selected]);

  const inspect = () => {
    returnFocus.current = sampleButtons.current[selected];
    setInspectionIndex(selected);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = selected;
    if (event.key === "ArrowRight") next++;
    else if (event.key === "ArrowLeft") next--;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = galleryAssets.length - 1;
    else return;
    event.preventDefault();
    next = Math.max(0, Math.min(galleryAssets.length - 1, next));
    if (next !== selected && (event.target as HTMLElement).hasAttribute("data-gallery-sample")) {
      pendingFocus.current = next;
    }
    select(next);
  };

  return (
    <section className={`section-space ${styles.gallery}`} id="work" aria-labelledby="gallery-heading">
      <div ref={track} className={styles.track} data-gallery-track>
        <div ref={panel} className={styles.panel} data-gallery-panel>
          <div className={styles.heading}>
            <div>
              <p className="eyebrow">03 / THE INSPIRATION GALLERY</p>
              <h2 id="gallery-heading">Ideas, <em>taking shape.</em></h2>
            </div>
            <p>A closer look at pattern, colour and texture.<br />Find a surface that starts something.</p>
          </div>
          <div className={styles.browser} data-still={still} onKeyDown={onKeyDown} role="group" aria-label="Tile sample browser" aria-describedby="gallery-instructions">
            <div className={styles.stage} ref={stage} data-gallery-stage>
              <div className={styles.metadata}>
                <p className={styles.collectionLabel}>THE SAMPLE EDIT <span>{number(selected)} / {galleryAssets.length}</span></p>
                <div key={active.id} className={styles.caption}>
                  <h3>{active.label}</h3>
                  <p>{active.category}</p>
                  <p className={styles.description}>{active.description}</p>
                </div>
              </div>
              <div className={styles.rail}>
                {galleryAssets.map((sample, index) => {
                  const distance = index - selected;
                  return (
                    <button
                      key={sample.id}
                      ref={(element) => { sampleButtons.current[index] = element; }}
                      type="button"
                      data-gallery-sample
                      data-offset={distance}
                      data-active={index === selected}
                      aria-label={index === selected ? `Inspect ${sample.label}` : `Select ${sample.label}`}
                      aria-haspopup={index === selected ? "dialog" : undefined}
                      aria-hidden={Math.abs(distance) > 2 || undefined}
                      tabIndex={index === selected ? 0 : -1}
                      className={styles.sample}
                      style={{ "--ratio": sample.width / sample.height, "--width-factor": Math.min(1, sample.width / sample.height) } as CSSProperties}
                      onClick={() => {
                        if (suppressClick.current) return;
                        if (index === selected) inspect();
                        else select(index);
                      }}
                    >
                      <span className={styles.face}>
                        <Image
                          src={sample.thumbnail}
                          alt={sample.alt}
                          width={sample.width}
                          height={sample.height}
                          sizes="(max-width: 600px) 62vw, (max-width: 1000px) 38vw, 420px"
                          draggable={false}
                          unoptimized
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
              <button type="button" className={styles.motionToggle} aria-pressed={still} onClick={() => setStill(!still)}>View without motion</button>
            </div>
            <div className={styles.controls}>
              <p className={styles.instructions} id="gallery-instructions"><span className={styles.scrollHint}>Scroll to explore <span>·</span> </span>Drag or use the arrows <span>·</span> Select to inspect</p>
              <div className={styles.browseControls}>
                <button type="button" className={styles.previous} aria-label="Previous sample" disabled={selected === 0} onClick={() => select(selected - 1)}><Arrow /></button>
                <span className={styles.counter} aria-hidden="true">{number(selected)} <i>/</i> {galleryAssets.length}</span>
                <button type="button" aria-label="Next sample" disabled={selected === galleryAssets.length - 1} onClick={() => select(selected + 1)}><Arrow /></button>
              </div>
              <button type="button" className={styles.inspect} onClick={inspect}>Inspect sample <Arrow diagonal /></button>
            </div>
            <div className={styles.index} role="group" aria-label="Choose a sample">
              {galleryAssets.map((sample, index) => (
                <button key={sample.id} type="button" aria-label={`Show ${sample.label}`} aria-pressed={selected === index} onClick={() => select(index)}>
                  <span>{number(index)}</span><i aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{active.label}, sample {selected + 1} of {galleryAssets.length}.</p>
          </div>
        </div>
      </div>
      <noscript><p className={styles.noScript}>Open a sample photograph: {galleryAssets.map((sample) => <a key={sample.id} href={sample.image}>{sample.label}</a>)}</p></noscript>
      <GalleryInspection sample={inspectionIndex === null ? null : galleryAssets[inspectionIndex]} onClose={() => setInspectionIndex(null)} returnFocus={returnFocus} />
    </section>
  );
}
