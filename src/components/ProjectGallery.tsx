"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import Arrow from "./Arrow";
const studies = [
  {
    name: "Midnight Garden",
    type: "Botanical mural",
    caption:
      "A single botanical artwork imagined as a continuous tiled feature. This room is a concept visualization, not a completed installation.",
    image: "/images/garden-room.webp",
    alt: "Magnolia tiled artwork in an illustrative warm living room",
    views: [
      { src: "/images/garden-room.webp", label: "Room concept" },
      { src: "/images/midnight-garden.webp", label: "Original artwork" },
    ],
  },
  {
    name: "A closer look",
    type: "Midnight Garden / Artwork detail",
    caption:
      "A closer crop of the same Midnight Garden artwork. Painterly shading belongs to the image and does not represent verified physical relief.",
    image: "/images/midnight-garden.webp",
    alt: "Close-up crop of creamy magnolia petals in the Midnight Garden artwork",
    views: [{ src: "/images/midnight-garden.webp", label: "Original artwork" }],
  },
  {
    name: "Terra Rhythm",
    type: "Geometric composition",
    caption:
      "An exploration of graphic rhythm in a boutique reception. This concept visualization suggests how a custom pattern might shape a commercial interior; specifications require project review.",
    image: "/images/terra-room.webp",
    alt: "Illustrative reception interior with ochre and terracotta geometric tiled wall",
    views: [{ src: "/images/terra-room.webp", label: "Room concept" }],
  },
];
export default function ProjectGallery() {
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState(0);
  const [view, setView] = useState(0);
  const active = studies[selected];
  const close = () => dialog.current?.close();
  return (
    <section className="gallery section-space" id="work">
      <div className="gallery-heading">
        <div>
          <p className="eyebrow">03 / THE INSPIRATION GALLERY</p>
          <h2>
            Ideas, <em>taking shape.</em>
          </h2>
        </div>
        <p>
          Two original design explorations.
          <br />A world of possible directions.
        </p>
      </div>
      <div className="gallery-grid">
        {studies.map((study, i) => (
          <button
            className={`gallery-item gallery-item-${i}`}
            key={study.name}
            onClick={(e) => {
              returnFocus.current = e.currentTarget;
              setSelected(i);
              setView(0);
              dialog.current?.showModal();
            }}
          >
            <div className="gallery-image">
              <Image
                src={study.image}
                alt={study.alt}
                fill
                sizes={
                  i === 0
                    ? "(max-width: 768px) 90vw, 57vw"
                    : "(max-width: 768px) 90vw, 33vw"
                }
              />
              <span className="gallery-open">
                <Arrow diagonal />
              </span>
            </div>
            <span className="gallery-caption">
              <span>
                <strong>{study.name}</strong>
                <small>{study.type}</small>
              </span>
              <small>
                {i === 1 ? "Artwork detail" : "Concept visualization"}
              </small>
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-labelledby="study-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onClose={() => returnFocus.current?.focus()}
      >
        <div className="dialog-inner">
          <button
            className="dialog-close"
            onClick={close}
            aria-label="Close design exploration"
          >
            Close <span>×</span>
          </button>
          <div className="dialog-image">
            <Image
              src={active.views[view].src}
              alt={
                view === 1
                  ? "Midnight Garden original flat botanical artwork with ivory magnolias and deep green leaves"
                  : active.alt
              }
              fill
              sizes="(max-width:768px) 95vw, 75vw"
            />
          </div>
          <div className="dialog-info">
            <div>
              <p className="eyebrow">DESIGN EXPLORATION</p>
              <h3 id="study-title">{active.name}</h3>
            </div>
            <p>{active.caption}</p>
          </div>
          {active.views.length > 1 && (
            <div className="dialog-tabs" aria-label="Available views">
              {active.views.map((v, i) => (
                <button
                  key={v.label}
                  aria-pressed={view === i}
                  onClick={() => setView(i)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </dialog>
    </section>
  );
}
