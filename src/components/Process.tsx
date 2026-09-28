import { process } from "@/lib/content";
import Arrow from "./Arrow";
import BrandLogo from "./BrandLogo";
export default function Process() {
  return (
    <section className="process section-space" id="process">
      <div className="process-intro">
        <p className="eyebrow">04 / A CREATIVE COLLABORATION</p>
        <h2>
          From Imagination
          <br />
          <em>to Tile.</em>
        </h2>
        <p className="process-reassurance">
          An idea is enough to start
          <br />
          the conversation.
        </p>
        <a className="text-link" href="#enquiry">
          Tell us what you’re imagining <Arrow diagonal />
        </a>
        <BrandLogo className="process-mark" />
      </div>
      <ol className="process-list">
        {process.map(([title, copy], i) => (
          <li key={title}>
            <span className="process-number">0{i + 1}</span>
            <div>
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
