import { faqs } from "@/lib/content";
export default function FAQ() {
  return (
    <section className="faq section-space" id="faq">
      <div>
        <p className="eyebrow">05 / BEFORE WE BEGIN</p>
        <h2>
          A little
          <br />
          <em>clarity.</em>
        </h2>
        <p>
          Custom means considered.
          <br />
          Here are a few things to know.
        </p>
      </div>
      <div className="faq-list">
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
