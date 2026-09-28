import Arrow from "./Arrow";
import HeroAtelier from "./HeroAtelier";

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
      <HeroAtelier />
      <div className="hero-bottom">
        <p>
          Tiles. Art. Spaces. <em>Endless Possibilities.</em>
        </p>
        <a href="#story">
          Discover the transformation <span>↓</span>
        </a>
      </div>
    </section>
  );
}
