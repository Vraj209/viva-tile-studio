import { process } from "@/lib/content";
import Arrow from "./Arrow";
import BrandLogo from "./BrandLogo";
export default function Process() {
  return (
    <section className="process section-space" id="process">
      <div className="process-intro" data-motion="editorial">
        <p className="eyebrow" data-motion-item>04 / A CREATIVE COLLABORATION</p>
        <h2 data-motion-item>
          From Imagination
          <br />
          <em>to Tile.</em>
        </h2>
        <p className="process-reassurance" data-motion-item>
          An idea is enough to start
          <br />
          the conversation.
        </p>
        <a className="text-link" href="#enquiry">
          Tell us what you’re imagining <Arrow diagonal />
        </a>
        <BrandLogo className="process-mark" sizes="(max-width: 768px) 148px, 180px" />
      </div>
      <ol className="process-list">
        {process.map(([title, copy], i) => (
          <li key={title} data-motion="process-step">
            <span className="process-number" data-motion-item>0{i + 1}</span>
            <div data-motion-item>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
            <span className="process-dot" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </section>
  );
}
