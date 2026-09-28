"use client";
import { useEffect, useRef, useState } from "react";
import Arrow from "./Arrow";
import BrandLogo from "./BrandLogo";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menu.current?.focus();
      }
    };
    const media = matchMedia("(min-width: 769px)");
    const resize = () => {
      if (media.matches) setOpen(false);
    };
    window.addEventListener("keydown", close);
    media.addEventListener("change", resize);
    return () => {
      window.removeEventListener("keydown", close);
      media.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="VAVI Tile Studio home">
        <BrandLogo eager />
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#work">Work</a>
        <a href="#possibilities">Possibilities</a>
        <a href="#process">Process</a>
        <a href="#specifications">Specifications</a>
      </nav>
      <a className="header-cta" href="#enquiry">
        Start your project <Arrow diagonal />
      </a>
      <button
        ref={menu}
        className="menu-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close" : "Menu"}
        <span>{open ? "−" : "+"}</span>
      </button>
      <nav
        id="mobile-nav"
        className="mobile-nav"
        hidden={!open}
        aria-label="Mobile navigation"
        onClick={() => setOpen(false)}
      >
        <a href="#work">
          Work <Arrow />
        </a>
        <a href="#possibilities">
          Possibilities <Arrow />
        </a>
        <a href="#process">
          Process <Arrow />
        </a>
        <a href="#specifications">
          Specifications <Arrow />
        </a>
        <a href="#enquiry">
          Start your project <Arrow />
        </a>
      </nav>
    </header>
  );
}
