import Image from "next/image";
import { faqs } from "@/lib/content";
import styles from "./FAQ.module.css";

export default function FAQ() {
  return (
    <section className={styles.section} id="faq" aria-labelledby="faq-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <div data-motion="quiet">
            <p className={`eyebrow ${styles.eyebrow}`} data-motion-item>
              06 / BEFORE WE BEGIN
            </p>
            <h2 id="faq-heading" data-motion-item>
              A little <em>clarity.</em>
            </h2>
            <p className={styles.description} data-motion-item>
              Custom means considered.
              <br />
              Here are a few things to know.
            </p>
          </div>
          <div className={styles.aperture}>
            <Image
              src="/brochures/products/surface-studies-10465-interior.jpg"
              alt="Supplied Surface Studies interior showing terracotta-toned botanical Design 10465 beside a timber door and an ivory console."
              fill
              sizes="(max-width: 360px) calc(100vw - 48px), 320px"
              className={styles.image}
            />
          </div>
        </div>
        <div className={styles.questions}>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span className={styles.toggle} aria-hidden="true" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
