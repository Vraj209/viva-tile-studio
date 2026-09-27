export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <a className="wordmark" href="#top" aria-label="VAVI Tile Studio home">
          VAVI<span>TILE STUDIO</span>
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
