"use client";

import { useEffect, useRef, useState } from "react";
import Arrow from "./Arrow";
import BrandLogo from "./BrandLogo";
import { lockPageScroll } from "@/lib/scroll";

const navigation = [
  { id: "work", label: "Work" },
  { id: "possibilities", label: "Possibilities" },
  { id: "process", label: "Process" },
  { id: "specifications", label: "Specifications" },
] as const;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const header = useRef<HTMLElement>(null);
  const sentinel = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) return lockPageScroll();
  }, [open]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menu.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const media = matchMedia("(min-width: 1024px)");
    const resize = () => {
      const focused = document.activeElement;
      if (media.matches) {
        if (focused === menu.current || focused?.closest("#mobile-nav")) {
          header.current?.querySelector<HTMLAnchorElement>(".wordmark")?.focus({ preventScroll: true });
        }
        setOpen(false);
      } else if (focused?.closest(".desktop-nav, .desktop-cta")) {
        menu.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", close);
    document.addEventListener("pointerdown", closeOutside);
    media.addEventListener("change", resize);
    return () => {
      window.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", closeOutside);
      media.removeEventListener("change", resize);
    };
  }, [open]);

  useEffect(() => {
    const topObserver = new IntersectionObserver(([entry]) => {
      setScrolled(entry.boundingClientRect.top < 0);
    });
    if (sentinel.current) topObserver.observe(sentinel.current);

    const sections = navigation.flatMap(({ id }) => {
      const section = document.getElementById(id);
      return section ? [section] : [];
    });
    let sectionObserver: IntersectionObserver;
    const observeSections = () => {
      sectionObserver?.disconnect();
      // Match the reading line used by native anchors and the existing Lenis scroller.
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const readingLine = Math.min(offset + 2, window.innerHeight - 1);
      const updateActive = () => {
        const current = sections.find((section) => {
          const bounds = section.getBoundingClientRect();
          return bounds.top < readingLine + 1 && bounds.bottom > readingLine;
        });
        setActiveSection(current?.id ?? null);
      };
      sectionObserver = new IntersectionObserver(updateActive, {
        rootMargin: `-${readingLine}px 0px -${Math.max(0, window.innerHeight - readingLine - 1)}px 0px`,
      });
      sections.forEach((section) => sectionObserver.observe(section));
    };
    observeSections();
    const resizeObserver = new ResizeObserver(observeSections);
    if (header.current) resizeObserver.observe(header.current);
    window.addEventListener("resize", observeSections);
    return () => {
      topObserver.disconnect();
      sectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", observeSections);
    };
  }, []);

  return (
    <>
      <span ref={sentinel} className="header-sentinel" aria-hidden="true" />
      <header
        ref={header}
        className="site-header"
        data-scrolled={scrolled}
        data-menu-open={open}
        onBlur={(event) => {
          if (open && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        <div className="header-inner">
          <a className="wordmark" href="#top" aria-label="VAVI Tile Studio home" onClick={() => setOpen(false)}>
            <BrandLogo eager sizes="(max-width: 1023px) 53px, 67px" />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map(({ id, label }) => (
              <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined}>
                <span className="nav-label">{label}</span>
              </a>
            ))}
          </nav>
          <a className="header-cta desktop-cta" href="#enquiry">
            Start your project <span className="header-cta-arrow"><Arrow diagonal /></span>
          </a>
          <button
            ref={menu}
            type="button"
            className="menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
            <span className="menu-toggle-icon" aria-hidden="true"><span /><span /></span>
          </button>
        </div>
        <nav
          id="mobile-nav"
          className="mobile-nav"
          data-lenis-prevent
          hidden={!open}
          aria-label="Mobile navigation"
        >
          {navigation.map(({ id, label }) => (
            <a
              key={id}
              className="mobile-nav-link"
              href={`#${id}`}
              aria-current={activeSection === id ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              <span className="nav-label">{label}</span><Arrow />
            </a>
          ))}
          <a className="header-cta" href="#enquiry" onClick={() => setOpen(false)}>
            Start your project <span className="header-cta-arrow"><Arrow diagonal /></span>
          </a>
        </nav>
      </header>
    </>
  );
}
