"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import type { GalleryAsset } from "@/lib/gallery-assets";
import { lockPageScroll } from "@/lib/scroll";
import styles from "./GalleryInspection.module.css";

type GalleryInspectionProps = {
  sample: GalleryAsset | null;
  onClose: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
};

export function GalleryInspection(props: GalleryInspectionProps) {
  if (!props.sample) return null;

  return <OpenInspection key={props.sample.id} {...props} sample={props.sample} />;
}

function OpenInspection({
  sample,
  onClose,
  returnFocus,
}: GalleryInspectionProps & { sample: GalleryAsset }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const startedOnBackdrop = useRef(false);
  const [viewIndex, setViewIndex] = useState(0);
  const titleId = useId();
  const descriptionId = useId();
  const views = [
    {
      image: sample.image,
      alt: sample.alt,
      label: sample.category,
      width: sample.imageWidth,
      height: sample.imageHeight,
    },
    ...(sample.related ?? []),
  ];
  const view = views[viewIndex] ?? views[0];

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    const trigger = returnFocus.current;
    const unlockScroll = lockPageScroll();
    element.showModal();
    closeButton.current?.focus({ preventScroll: true });

    return () => {
      if (element.open) element.close();
      unlockScroll();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      data-lenis-prevent
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onPointerDown={(event) => {
        startedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (
          startedOnBackdrop.current &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
        startedOnBackdrop.current = false;
      }}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>A closer look</p>
          <button
            ref={closeButton}
            className={styles.close}
            type="button"
            onClick={onClose}
            aria-label="Close sample inspection"
          >
            Close
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="m4 4 10 10M14 4 4 14" fill="none" stroke="currentColor" />
            </svg>
          </button>
        </header>

        <div className={styles.content}>
          <figure className={styles.figure}>
            <div className={styles.image}>
              <Image
                key={view.image}
                src={view.image}
                alt={view.alt}
                width={view.width}
                height={view.height}
                sizes="(max-width: 720px) 90vw, (max-width: 1200px) 64vw, 750px"
                loading="eager"
                unoptimized
              />
            </div>
            <figcaption className={styles.caption}>
              <span aria-live="polite">{view.label}</span>
            </figcaption>
          </figure>

          <div className={styles.information}>
            <p className={styles.eyebrow}>{sample.category}</p>
            <h3 id={titleId} className={styles.title}>
              {sample.label}
            </h3>
            <p id={descriptionId} className={styles.description}>
              {sample.description}
            </p>

            {views.length > 1 ? (
              <div className={styles.views} role="group" aria-label="Photograph views">
                <p className={styles.eyebrow}>Explore the sample</p>
                {views.map((item, index) => (
                  <button
                    key={item.image}
                    type="button"
                    aria-pressed={viewIndex === index}
                    onClick={() => setViewIndex(index)}
                  >
                    <span>{item.label}</span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  );
}
