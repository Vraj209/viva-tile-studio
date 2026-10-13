import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function SiteFooter({ homePage = true }: { homePage?: boolean }) {
  const SectionLink = homePage ? "a" : Link;
  const sectionHref = (id: string) => `${homePage ? "" : "/"}#${id}`;
  return (
    <footer className="site-footer">
      <div className="footer-top" data-motion="footer">
        <div className="footer-brand" data-motion-item>
          <SectionLink
            className="wordmark"
            href={sectionHref("top")}
            aria-label="VAVI Tile Studio home"
          >
            <BrandLogo sizes="(max-width: 768px) 88px, 104px" />
          </SectionLink>
          <p>
            Tiles. Art. Spaces.
            <br />
            <em>Endless Possibilities.</em>
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <div className="footer-link-group">
            <p className="footer-label">Explore</p>
            <SectionLink href={sectionHref("work")}>Work</SectionLink>
            <SectionLink href={sectionHref("possibilities")}>Possibilities</SectionLink>
            <Link href="/brochures">Brochures</Link>
          </div>
          <div className="footer-link-group">
            <p className="footer-label">Your project</p>
            <SectionLink href={sectionHref("process")}>Process</SectionLink>
            <SectionLink href={sectionHref("specifications")}>Specifications</SectionLink>
            <SectionLink href={sectionHref("faq")}>FAQ</SectionLink>
            <SectionLink href={sectionHref("enquiry")}>Start your project ↗</SectionLink>
          </div>
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
