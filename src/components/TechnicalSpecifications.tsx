import {
  specificationGroups,
  technicalDownload,
} from "@/lib/technical-specifications";
import Arrow from "./Arrow";
import styles from "./TechnicalSpecifications.module.css";

export default function TechnicalSpecifications() {
  return (
    <section
      id="specifications"
      className={`section-space ${styles.section}`}
      aria-labelledby="specifications-heading"
    >
      <div className={styles.heading} data-motion="quiet">
        <div data-motion-item>
          <p className="eyebrow">05 / THE DETAILS BEHIND THE DESIGN</p>
          <h2 id="specifications-heading">
            Technical <em>Specifications</em>
          </h2>
        </div>
        <p className={styles.introduction} data-motion-item>
          Explore material, format, installation and care information. Confirm
          the selected product’s specifications and suitability for your project
          before ordering.
        </p>
      </div>

      <p className={styles.attribution}>
        Product details below are stated in the supplied technical datasheet.
        They are not independent test results or certification.
      </p>

      {specificationGroups.map((group) => (
        <div className={styles.group} key={group.id}>
          <div className={styles.groupHeading}>
            <span className="eyebrow" aria-hidden="true">
              {group.number}
            </span>
            <h3 id={`specifications-${group.id}`}>{group.title}</h3>
          </div>
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
        </div>
      ))}

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
            className="button"
            href={technicalDownload.href}
            download={technicalDownload.filename}
            aria-describedby="technical-download-note"
          >
            {technicalDownload.label}
            <span className={styles.downloadArrow}>
              <Arrow />
            </span>
          </a>
          <a className="text-link" href="#enquiry">
            Request Project-Specific Specifications <Arrow diagonal />
          </a>
        </div>
      </div>
    </section>
  );
}
