import Image from "next/image";
import footerArtwork from "../../public/images/footer.png";
import BrandLogo from "./BrandLogo";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-artwork">
          <Image
            src={footerArtwork}
            alt=""
            loading="lazy"
            sizes="(min-width: 1101px) 89vw, 1px"
          />
        </div>
        <a className="wordmark" href="#top" aria-label="VAVI Tile Studio home">
          <BrandLogo />
        </a>
        <p>
          Tiles. Art. Spaces.
          <br />
          <em>Endless Possibilities.</em>
        </p>
        <nav aria-label="Footer navigation">
          <a href="#work">Work</a>
          <a href="#possibilities">Possibilities</a>
          <a href="#process">Process</a>
          <a href="#specifications">Specifications</a>
          <a href="#faq">FAQ</a>
          <a href="#enquiry">Start your project ↗</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} VAVI Tile Studio.</p>
        <p>Bring Your Imagination Into Reality.</p>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
