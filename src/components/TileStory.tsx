"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { requestScrollRefresh } from "@/lib/scroll";
import {
  roomReveal,
  segment,
  STORY_MEDIA,
  storyChapter,
  type StoryMotion,
} from "@/lib/motion";
import styles from "./TileStory.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The renderer is never imported on mobile or for reduced-motion visitors.
const TileScene = dynamic(() => import("./TileScene"), { ssr: false });

const chapters = [
  {
    title: "Your idea.",
    text: "A photograph, a sketch, a pattern. Or simply something you can’t stop imagining.",
    detail: "01 / THE STARTING POINT",
    label: "Original artwork · Design exploration",
  },
  {
    title: "Your tile.",
    text: "See your idea take shape on a tile. Consider the colour, the detail, the feeling.",
    detail: "02 / A MATERIAL EXPRESSION",
    label: "Tile study · Concept visualization",
  },
  {
    title: "Your composition.",
    text: "One design, carried across a considered arrangement. A whole made from individual pieces.",
    detail: "03 / THE BIGGER PICTURE",
    label: "Illustrative 3 × 3 arrangement",
  },
  {
    title: "Your space.",
    text: "An idea becomes part of a room. Something personal, with a place in your everyday.",
    detail: "04 / A NEW PERSPECTIVE",
    label: "Interior study · Concept visualization",
  },
];

function StaticArtwork({ index }: { index: number }) {
  if (index === 3) {
    return (
      <Image
        src="/images/garden-room.webp"
        alt="Concept interior with the Midnight Garden artwork continuing across nine tiles above a timber console."
        fill
        sizes="(max-width: 767px) 92vw, 44vw"
        className={styles.roomImage}
      />
    );
  }

  if (index === 2) {
    return (
      <div
        className={styles.staticComposition}
        role="img"
        aria-label="The same Midnight Garden artwork divided continuously across an illustrative three-by-three tile composition."
      >
        {Array.from({ length: 9 }, (_, piece) => (
          <span
            key={piece}
            style={{
              backgroundPosition: `${(piece % 3) * 50}% ${Math.floor(piece / 3) * 50}%`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={index === 1 ? styles.staticTile : styles.staticIdea}>
      <Image
        src="/images/midnight-garden.webp"
        alt={
          index === 1
            ? "Midnight Garden artwork shown on a thin, neutral tile concept."
            : "Midnight Garden, a square botanical artwork with pale magnolia flowers and deep green leaves."
        }
        fill
        sizes="(max-width: 767px) 64vw, 30vw"
      />
    </div>
  );
}

export default function TileStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const motion = useRef<StoryMotion>({ progress: 0, active: false });
  const [eligible, setEligible] = useState(false);
  const [manualOff, setManualOff] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [failureReason, setFailureReason] = useState("");
  const [webglSupport, setWebglSupport] = useState("unchecked");
  const [retainTrack, setRetainTrack] = useState(false);
  const hasRendered = useRef(false);
  const enhanced = eligible && !manualOff && (!sceneFailed || retainTrack);

  const onReady = useCallback(() => {
    hasRendered.current = true;
    setSceneReady(true);
  }, []);
  const onUnavailable = useCallback((reason = "renderer-unavailable") => {
    // A late context loss must not collapse 220vh beneath the visitor.
    setRetainTrack(hasRendered.current);
    setSceneFailed(true);
    setFailureReason(reason);
    setSceneReady(false);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(STORY_MEDIA);
    const update = () => {
      const hasWebglApi = "WebGL2RenderingContext" in window;
      setWebglSupport(hasWebglApi ? "api-available" : "api-unavailable");
      setEligible(query.matches && hasWebglApi);
      if (!query.matches) setSceneReady(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !enhanced) return;
    const model = motion.current;
    let inView = false;
    const syncActivity = () => {
      model.active = inView && !document.hidden;
      if (model.active) model.invalidate?.();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncActivity();
    });
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearby(true);
          preloadObserver.disconnect();
        }
      },
      { rootMargin: "500px 0px" },
    );
    observer.observe(stage);
    preloadObserver.observe(stage);
    document.addEventListener("visibilitychange", syncActivity);
    return () => {
      observer.disconnect();
      preloadObserver.disconnect();
      document.removeEventListener("visibilitychange", syncActivity);
      model.active = false;
    };
  }, [enhanced]);

  useGSAP(
    () => {
      requestScrollRefresh();
      if (!enhanced || !trackRef.current || !stageRef.current) return;
      const stage = stageRef.current;
      const captions = Array.from(
        stage.querySelectorAll<HTMLElement>("[data-story-caption]"),
      );
      const markers = Array.from(
        stage.querySelectorAll<HTMLElement>("[data-story-marker]"),
      );
      const room = stage.querySelector<HTMLElement>("[data-story-room]");
      const canvas = stage.querySelector<HTMLElement>("[data-story-canvas]");
      const poster = stage.querySelector<HTMLElement>("[data-story-poster]");
      let currentChapter = -1;

      const update = () => {
        const progress = motion.current.progress;
        const chapter = storyChapter(progress);
        if (chapter !== currentChapter) {
          currentChapter = chapter;
          captions.forEach((caption, index) => {
            caption.dataset.current = String(index === chapter);
          });
          markers.forEach((marker, index) => {
            marker.dataset.current = String(index === chapter);
          });
        }
        const reveal = roomReveal(progress);
        if (room) room.style.opacity = String(reveal);
        if (canvas) canvas.style.opacity = String(1 - reveal);
        if (poster) {
          const matchCut = segment(progress, 0.72, 0.84);
          const turn =
            segment(progress, 0.16, 0.29) * (1 - segment(progress, 0.42, 0.65));
          poster.style.left = `${50 - 9.3 * matchCut}%`;
          poster.style.top = `${50 - 16.7 * matchCut}%`;
          poster.style.transform = `translate(-50%, -50%) perspective(800px) rotateY(${-25 * turn}deg) rotateX(${7.5 * turn}deg) scale(${1 + 0.016 * matchCut}, ${1 - 0.049 * matchCut})`;
          poster.style.setProperty(
            "--poster-grid",
            String(segment(progress, 0.45, 0.55)),
          );
        }
        stage.style.setProperty("--story-progress", String(progress));
        if (motion.current.active) motion.current.invalidate?.();
      };

      motion.current.progress = 0;
      update();
      const timeline = gsap.timeline({
        onUpdate: update,
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      timeline.to(
        motion.current,
        { progress: 1, duration: 1, ease: "none" },
        0,
      );
      [0.23, 0.49, 0.78].forEach((boundary, index) => {
        timeline.to(
          captions[index],
          { opacity: 0, y: -8, duration: 0.04, ease: "none" },
          boundary - 0.02,
        );
        timeline.fromTo(
          captions[index + 1],
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.04,
            ease: "none",
            immediateRender: false,
          },
          boundary - 0.02,
        );
      });
      return () => {
        stage.style.removeProperty("--story-progress");
      };
    },
    { scope: sectionRef, dependencies: [enhanced], revertOnUpdate: true },
  );

  return (
    <section
      id="story"
      ref={sectionRef}
      className={`${styles.story} ${enhanced ? styles.enhanced : ""}`}
      aria-labelledby="story-title"
      data-story-mode={
        enhanced
          ? sceneFailed
            ? "poster-fallback"
            : sceneReady
              ? "webgl"
              : "poster-loading"
          : "static"
      }
      data-story-eligible={eligible}
      data-story-failed={sceneFailed}
      data-story-failure={failureReason || undefined}
      data-story-nearby={nearby}
      data-story-webgl={webglSupport}
      data-story-motion-off={manualOff}
    >
      <header className={styles.intro} data-motion="editorial">
        <p className={styles.eyebrow} data-motion-item>AN IDEA, GIVEN FORM</p>
        <h2 id="story-title" data-motion-item>
          From imagination
          <br />
          to a space that is <em>yours.</em>
        </h2>
        <p className={styles.introNote} data-motion-item>
          Follow one design, from a first thought
          <br className={styles.desktopBreak} /> to a new point of view.
        </p>
        {eligible && !sceneFailed ? (
          <div className={styles.motionControl}>
            <button
              type="button"
              className={styles.motionToggle}
              aria-pressed={manualOff}
              onClick={() => {
                setSceneReady(false);
                setManualOff((off) => !off);
              }}
            >
              <span className={styles.motionIndicator} aria-hidden="true">
                {manualOff ? "✓" : "Ⅱ"}
              </span>
              View without motion
            </button>
            <span className={styles.motionState} role="status">
              {manualOff ? "Motion is off. Select again to use motion." : ""}
            </span>
          </div>
        ) : null}
      </header>

      <div ref={trackRef} className={styles.track}>
        <ol className={styles.baseline}>
          {chapters.map((chapter, index) => (
            <li key={chapter.title} className={styles.staticCard}>
              <div
                className={`${styles.staticImage} ${index === 3 ? styles.staticRoom : ""}`}
              >
                <StaticArtwork index={index} />
              </div>
              <div className={styles.staticCaption}>
                <p className={styles.eyebrow}>{chapter.detail}</p>
                <h3>{chapter.title}</h3>
                <p>{chapter.text}</p>
                <small>{chapter.label}</small>
              </div>
            </li>
          ))}
        </ol>

        {enhanced ? (
          <div ref={stageRef} className={styles.stage}>
            <div className={styles.stageTop} aria-hidden="true">
              <span>MIDNIGHT GARDEN / A DESIGN EXPLORATION</span>
              <span>ONE IDEA. MANY POSSIBILITIES.</span>
            </div>
            <div className={styles.stageMain} aria-hidden="true">
              <div className={styles.captionStack}>
                {chapters.map((chapter, index) => (
                  <div
                    key={chapter.title}
                    data-story-caption
                    data-current={index === 0 ? "true" : "false"}
                    className={styles.liveCaption}
                  >
                    <p className={styles.eyebrow}>{chapter.detail}</p>
                    <h3>{chapter.title}</h3>
                    <p>{chapter.text}</p>
                    <small>{chapter.label}</small>
                  </div>
                ))}
              </div>
              <div className={styles.stageVisual}>
                <div data-story-canvas className={styles.canvasLayer}>
                  <div
                    data-story-poster
                    className={`${styles.poster} ${sceneReady ? styles.posterReady : ""}`}
                  >
                    <Image
                      src="/images/midnight-garden.webp"
                      alt=""
                      fill
                      sizes="30vw"
                    />
                  </div>
                  {enhanced && nearby && !sceneFailed ? (
                    <TileScene
                      motionRef={motion}
                      onReady={onReady}
                      onUnavailable={onUnavailable}
                    />
                  ) : null}
                </div>
                <div data-story-room className={styles.roomLayer}>
                  <Image
                    src="/images/garden-room.webp"
                    alt=""
                    fill
                    sizes="66vw"
                    className={styles.roomImage}
                  />
                </div>
                <span className={styles.visualCaption}>
                  ARTWORK → SURFACE → SPACE
                </span>
              </div>
            </div>
            <div className={styles.stageBottom} aria-hidden="true">
              <div className={styles.chapterMarkers}>
                {chapters.map((chapter, index) => (
                  <span
                    key={chapter.title}
                    data-story-marker
                    data-current={index === 0 ? "true" : "false"}
                  >
                    <b>0{index + 1}</b> {chapter.title.replace(".", "")}
                  </span>
                ))}
              </div>
              <p>
                SCROLL TO FOLLOW THE IDEA <span>↓</span>
              </p>
            </div>
            <div className={styles.progressTrack} aria-hidden="true">
              <span />
            </div>
            <nav className={styles.storySkip} aria-label="Story shortcuts">
              <a href="#work">
                Skip to gallery <span aria-hidden="true">↗</span>
              </a>
              <a href="#enquiry">
                Start your project <span aria-hidden="true">↗</span>
              </a>
            </nav>
          </div>
        ) : null}
      </div>

      <div className={styles.storyFooter}>
        <p>Design exploration. Tile layouts and interiors are illustrative.</p>
        <nav aria-label="Skip the design story">
          <a href="#work">
            Explore the gallery <span aria-hidden="true">↗</span>
          </a>
          <a href="#enquiry">
            Start your project <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </section>
  );
}
