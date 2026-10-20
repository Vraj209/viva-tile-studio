import Image from "next/image";
import { process } from "@/lib/content";
import Arrow from "./Arrow";
import styles from "./Process.module.css";

export default function Process() {
  return (
    <section className={styles.section} id="process" aria-labelledby="process-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <div data-motion="editorial">
            <p className={`eyebrow ${styles.eyebrow}`} data-motion-item>
              04 / A CREATIVE COLLABORATION
            </p>
            <h2 id="process-heading" data-motion-item>
              From Imagination{" "}
              <em>to Tile.</em>
            </h2>
            <p className={styles.reassurance} data-motion-item>
              An idea is enough to start the conversation.
            </p>
            <a className={`text-link ${styles.link}`} href="#enquiry">
              Tell us what you’re imagining <Arrow diagonal />
            </a>
          </div>
          <figure className={styles.study}>
            <div className={styles.imageFrame} data-motion-frame>
              <Image
                src="/images/chapters/atelier-study.webp"
                alt="Concept study of ivory sculptural tile samples on limestone with a drawing pencil."
                fill
                sizes="(max-width: 768px) calc(100vw - 48px), (max-width: 1600px) 43vw, 640px"
                className={styles.image}
                data-motion-image
              />
            </div>
            <figcaption>Exploring form, texture and light.</figcaption>
          </figure>
        </div>
        <ol className={styles.steps}>
          {process.map(([title, copy], i) => (
            <li key={title} data-motion="process-step">
              <span className={styles.number} aria-hidden="true" data-motion-item>
                0{i + 1}
              </span>
              <div data-motion-item>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
