"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { heroSamples } from "@/lib/hero-samples";
import { atelierPoses, useHeroMotion } from "@/lib/use-hero-motion";
import styles from "./HeroAtelier.module.css";

type InputMode = "pointer" | "keyboard" | "touch" | null;

export default function HeroAtelier() {
  const stageRef = useRef<HTMLDivElement>(null);
  const hitRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indexRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mode = useRef<InputMode>(null);
  const [active, setActive] = useState<number | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  const [still, setStill] = useState(false);
  useHeroMotion(stageRef, active, still);

  function select(index: number, input: InputMode) {
    mode.current = input;
    setKeyboard(input === "keyboard");
    if (input === "keyboard") setFocused(index);
    setActive(index);
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next = index;
    if (event.key === "Escape") {
      event.preventDefault();
      setActive(null);
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % heroSamples.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + heroSamples.length - 1) % heroSamples.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = heroSamples.length - 1;
    else return;
    event.preventDefault();
    select(next, "keyboard");
    const controls = event.currentTarget.hasAttribute("data-atelier-index") ? indexRefs : hitRefs;
    controls.current[next]?.focus({ preventScroll: true });
  }

  const selected = active === null ? null : heroSamples[active];

  return (
    <div
      className={styles.atelier}
      role="group"
      aria-label="The material atelier, six original tile concepts"
      aria-describedby="atelier-instructions"
      data-keyboard={keyboard}
      data-still={still}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          mode.current = null;
          setKeyboard(false);
          setFocused(null);
          setActive(null);
        }
      }}
    >
      <div className={styles.heading} aria-hidden="true">
        <span>THE MATERIAL ATELIER</span>
        <span>01 — 06</span>
      </div>
      <div
        ref={stageRef}
        className={styles.stage}
        data-atelier-stage
        data-motion-depth="atelier"
        onPointerLeave={() => {
          if (mode.current === "pointer") setActive(null);
        }}
      >
        <div className={styles.scene}>
        {heroSamples.map((sample, index) => {
          const pose = atelierPoses[index];
          const placement = {
            "--x": `${pose.x}%`, "--y": `${pose.y}%`,
            "--angle": `${pose.angle}deg`, "--depth": `${pose.depth}px`,
          } as CSSProperties;
          return (
            <div
              key={sample.id}
              className={styles.tile}
              style={placement}
              data-atelier-tile
              data-selected={active === index}
              data-focused={keyboard && focused === index}
            >
              <div className={styles.face}>
                <Image
                  src={sample.src}
                  alt={sample.alt}
                  width={sample.width}
                  height={sample.height}
                  sizes="(max-width: 389px) calc(34vw - 13.6px), (max-width: 768px) min(201px, calc(34vw - 16.32px)), min(281px, 16vw, max(116px, calc(36svh - 101px)))"
                  loading={index === 5 ? "eager" : "lazy"}
                  fetchPriority={index === 5 ? "high" : "auto"}
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
        </div>
        {/* Hit regions stay in their resting poses, independent of moving faces.
            Their fixed order prevents selection from feeding back into hit testing. */}
        <div className={styles.hitLayer}>
          {heroSamples.map((sample, index) => {
            const pose = atelierPoses[index];
            return (
              <button
                key={sample.id}
                ref={(node) => { hitRefs.current[index] = node; }}
                className={styles.hit}
                style={{
                  "--x": `${pose.x}%`, "--y": `${pose.y}%`,
                  "--angle": `${pose.angle}deg`, "--order": index + 1,
                } as CSSProperties}
                type="button"
                aria-label={`Select ${sample.label}`}
                aria-pressed={active === index}
                data-atelier-hit={index}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse" && mode.current !== "keyboard") select(index, "pointer");
                }}
                onPointerMove={(event) => {
                  // Layout/scroll changes under a stationary mouse must not
                  // steal a selection made with the keyboard.
                  if (event.pointerType === "mouse" && (event.movementX !== 0 || event.movementY !== 0)) select(index, "pointer");
                }}
                onPointerDown={(event) => {
                  mode.current = event.pointerType === "touch" ? "touch" : "pointer";
                  setKeyboard(false);
                }}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) select(index, "keyboard");
                }}
                onClick={(event) => {
                  if (event.detail === 0) select(index, "keyboard");
                  else if (mode.current === "touch") setActive(active === index ? null : index);
                  else select(index, "pointer");
                }}
                onKeyDown={(event) => navigate(event, index)}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.caption} aria-live="polite" aria-atomic="true">
          <span className={styles.rule} aria-hidden="true" />
          <p>
            <span>{selected ? selected.label : "A study in surface"}</span>
            <small>{selected ? `DESIGN CONCEPT ${String(active! + 1).padStart(2, "0")} / 06` : "SIX ORIGINAL DESIGN CONCEPTS"}</small>
          </p>
        </div>
        <p id="atelier-instructions" className={styles.instructions}>
          <span className={styles.hoverHint}>Hover to explore</span>
          <span className={styles.touchHint}>Tap a surface to explore</span>
          <span className={styles.srOnly}>. Use Tab or arrow keys to select a sample. Escape returns the composition.</span>
        </p>
      </div>
      <div className={styles.options}>
        <div className={styles.index} aria-label="Choose a surface">
          {heroSamples.map((sample, index) => (
            <button
              key={sample.id}
              ref={(node) => { indexRefs.current[index] = node; }}
              data-atelier-index={index}
              type="button"
              aria-label={`Present ${sample.label}`}
              aria-pressed={active === index}
              onClick={(event) => {
                if (event.detail === 0) select(index, "keyboard");
                else { mode.current = "touch"; setKeyboard(false); setActive(active === index ? null : index); }
              }}
              onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) select(index, "keyboard"); }}
              onKeyDown={(event) => navigate(event, index)}
            >{String(index + 1).padStart(2, "0")}</button>
          ))}
        </div>
        <button type="button" className={styles.motion} aria-pressed={still} onFocus={() => { setKeyboard(false); setFocused(null); }} onClick={() => setStill(!still)}>
          {still ? "Enable motion" : "Pause motion"}
        </button>
      </div>
      <noscript>
        <style>{`.${styles.hitLayer}, .${styles.options}, .${styles.instructions} { display: none !important; }`}</style>
        <p className={styles.noScript}>Original tile design concepts. Explore supplied samples in <a href="#work">the inspiration gallery</a>.</p>
      </noscript>
    </div>
  );
}
