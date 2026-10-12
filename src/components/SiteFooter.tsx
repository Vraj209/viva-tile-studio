import Image from "next/image";
import Link from "next/link";
import footerArtwork from "../../public/images/footer.png";
import BrandLogo from "./BrandLogo";

export default function SiteFooter({ homePage = true }: { homePage?: boolean }) {
  const SectionLink = homePage ? "a" : Link;
  const sectionHref = (id: string) => `${homePage ? "" : "/"}#${id}`;
  return (
    <footer className="site-footer">
      <div className="footer-top" data-motion="footer">
        <div className="footer-artwork" data-motion-frame>
          <Image
            data-motion-image
            src={footerArtwork}
            alt=""
            loading="lazy"
            sizes="(min-width: 1101px) 89vw, 1px"
          />
        </div>
        <SectionLink className="wordmark" href={sectionHref("top")} aria-label="VAVI Tile Studio home">
          <BrandLogo sizes="(max-width: 768px) 132px, 160px" />
        </SectionLink>
        <p data-motion-item>
          Tiles. Art. Spaces.
          <br />
          <em>Endless Possibilities.</em>
        </p>
        <nav aria-label="Footer navigation">
          <SectionLink href={sectionHref("work")}>Work</SectionLink>
          <SectionLink href={sectionHref("possibilities")}>Possibilities</SectionLink>
          <SectionLink href={sectionHref("process")}>Process</SectionLink>
          <SectionLink href={sectionHref("specifications")}>Specifications</SectionLink>
          <Link href="/brochures">Brochures</Link>
          <SectionLink href={sectionHref("faq")}>FAQ</SectionLink>
          <SectionLink href={sectionHref("enquiry")}>Start your project ↗</SectionLink>
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
