import Image from "next/image";
import Arrow from "./Arrow";
import HeroMotion from "./HeroMotion";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <p className="eyebrow">
          VAVI TILE STUDIO <span>/</span> CUSTOM TILE DESIGN
        </p>
        <h1 id="hero-heading">
          Bring Your
          <br />
          <em>Imagination</em>
          <br />
          Into Reality.
        </h1>
        <p className="hero-description">
          Custom tile designs created around your artwork, your ideas, and your
          space.
        </p>
        <div className="hero-actions">
          <a className="button" href="#enquiry">
            Start your project <Arrow diagonal />
          </a>
          <a className="text-link" href="#possibilities">
            Explore the possibilities <Arrow />
          </a>
        </div>
      </div>
      <div
        className="hero-objects"
        aria-label="Midnight Garden, an illustrative tile design exploration"
      >
        <div className="tile-fan" id="tile-fan">
          <div className="sample sample-6" />
          <div className="sample sample-5" />
          <div className="sample sample-4" />
          <div className="sample sample-3" />
          <div className="sample sample-2" />
          <div className="sample sample-main">
            <Image
              src="/images/midnight-garden.webp"
              alt="Ivory magnolias and olive foliage on a forest-green ground"
              width={1254}
              height={1254}
              sizes="(max-width: 768px) 75vw, 38vw"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
        <div className="sample-caption">
          <span className="caption-rule" />
          <p>
            <span>STUDY Nº 01 — MIDNIGHT GARDEN</span>
            <small>Illustrative tile concept · flat artwork</small>
          </p>
        </div>
      </div>
      <div className="hero-bottom">
        <p>
          Tiles. Art. Spaces. <em>Endless Possibilities.</em>
        </p>
        <a href="#story">
          Discover the transformation <span>↓</span>
        </a>
      </div>
      <HeroMotion />
    </section>
  );
}
