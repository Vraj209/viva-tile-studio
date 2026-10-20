import Image from "next/image";
import {
  specificationGroups,
  technicalDownload,
} from "@/lib/technical-specifications";
import Arrow from "./Arrow";
import styles from "./TechnicalSpecifications.module.css";

const groupSubjects: Record<string, string> = {
  "materials-formats": "Bodies, dimensions & construction",
  "performance-applications": "Properties, placement & suitability",
  "installation-care": "Preparation, fixing & everyday care",
};

export default function TechnicalSpecifications() {
  return (
    <section
      id="specifications"
      className={styles.section}
      aria-labelledby="specifications-heading"
    >
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div className={styles.headingCopy} data-motion="quiet">
            <p className="eyebrow" data-motion-item>
              05 / THE DETAILS BEHIND THE DESIGN
            </p>
            <h2 id="specifications-heading" data-motion-item>
              Technical <em>Specifications</em>
            </h2>
            <p className={styles.introduction} data-motion-item>
              Explore material, format, installation and care information. Confirm
              the selected product’s specifications and suitability for your
              project before ordering.
            </p>
          </div>
          <figure className={styles.specimen}>
            <div className={styles.specimenFrame} data-motion-frame>
              <Image
                className={styles.specimenImage}
                src="/images/hero/sage-ginkgo.webp"
                alt="Sage-green tile concept with three sculptural ginkgo leaves and fine radiating veins."
                fill
                sizes="(max-width: 768px) 72vw, (max-width: 1600px) 34vw, 480px"
                data-motion-image
              />
            </div>
            <figcaption>Botanical relief study / Concept visualization</figcaption>
          </figure>
        </div>

        <p className={styles.attribution}>
          Product details below are stated in the supplied technical datasheet.
          They are not independent test results or certification.
        </p>

        <div className={styles.archive}>
          {specificationGroups.map((group) => (
            <details className={styles.group} key={group.id}>
              <summary className={styles.groupHeading}>
                <span className={styles.groupNumber} aria-hidden="true">
                  {group.number}
                </span>
                <h3 id={`specifications-${group.id}`}>{group.title}</h3>
                <span className={styles.groupSubject}>
                  {groupSubjects[group.id]}
                </span>
                <span className={styles.toggle} aria-hidden="true" />
              </summary>
              <div className={styles.groupContent}>
                {group.introduction ? (
                  <p className={styles.groupIntroduction}>{group.introduction}</p>
                ) : null}
                <dl aria-labelledby={`specifications-${group.id}`}>
                  {group.rows.map((row) => (
                    <div className={styles.row} key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>
                        <p>{row.value}</p>
                        {row.items ? (
                          <ul className={styles.formats}>
                            {row.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : null}
                        {row.note ? (
                          <p className={styles.note}>{row.note}</p>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
                {group.restriction ? (
                  <p className={styles.restriction}>
                    <strong>{group.restriction}</strong>
                  </p>
                ) : null}
              </div>
            </details>
          ))}
        </div>

        <div className={styles.download}>
          <div>
            <p className="eyebrow">KEEP THE DETAILS CLOSE</p>
            <h3>The source datasheet.</h3>
            <p className={styles.downloadNote} id="technical-download-note">
              {technicalDownload.note}
            </p>
          </div>
          <div className={styles.actions}>
            <a
              className={styles.downloadButton}
              href={technicalDownload.href}
              download={technicalDownload.filename}
              aria-describedby="technical-download-note"
            >
              {technicalDownload.label}
              <span className={styles.downloadArrow}>
                <Arrow />
              </span>
            </a>
            <a className={styles.projectLink} href="#enquiry">
              Request Project-Specific Specifications <Arrow diagonal />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
