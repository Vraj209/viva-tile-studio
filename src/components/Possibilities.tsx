import Image from "next/image";
import { applications } from "@/lib/content";
import DiscussLink from "./DiscussLink";
export default function Possibilities() {
  return (
    <section id="possibilities" className="possibilities section-space">
      <div className="section-heading">
        <p className="eyebrow">02 / MADE AROUND YOU</p>
        <h2>
          Your Idea.
          <br />
          Your Tile. <em>Your Space.</em>
        </h2>
        <p>
          A surface can hold more than a pattern.
          <br />
          It can hold a little of who you are.
        </p>
      </div>
      <div className="application-grid">
        {applications.map((item) => (
          <article
            className={`application application-${item.number}`}
            key={item.number}
          >
            <figure>
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 90vw, 43vw"
              />
              <figcaption>
                {item.number === "02"
                  ? "Artwork study"
                  : "Concept visualization"}
              </figcaption>
            </figure>
            <div className="application-meta">
              <span>{item.number}</span>
              <p className="eyebrow">{item.audience}</p>
            </div>
            <h3>{item.title}</h3>
            <p className="application-description">{item.text}</p>
            <DiscussLink
              projectType={item.projectType}
              application={item.application}
            />
          </article>
        ))}
      </div>
      <p className="application-note">
        Every idea starts with a project review. Suitability, materials and
        finishes are confirmed for the intended application.
      </p>
    </section>
  );
}
