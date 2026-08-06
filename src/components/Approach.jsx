import React from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../i18n";

export function MarketValidationCard() {
  const { t } = useI18n();
  return (
    <aside className="market-card">
      <div>
        <h3>{t.market.title}</h3>
        <p>{t.market.text}</p>
        <p className="market-note">{t.market.note}</p>
      </div>
      <a className="button button-dark" href="#contact">
        {t.market.cta} <ArrowRight size={16} aria-hidden="true" />
      </a>
    </aside>
  );
}

export default function Approach() {
  const { t } = useI18n();

  return (
    <section className="approach section" id="approach">
      <div className="section-intro approach-intro">
        <p className="section-kicker mono">{t.approach.kicker}</p>
        <div>
          <h2>{t.approach.title}</h2>
          <p className="approach-lead">{t.approach.lead}</p>
        </div>
      </div>

      <ol className="approach-steps">
        {t.approach.steps.map((step, index) => (
          <li key={step.num}>
            <span className="mono">{step.num}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            {index < t.approach.steps.length - 1 ? (
              <span className="approach-connector" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>

      <ul className="approach-pillars">
        {t.approach.pillars.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <MarketValidationCard />
    </section>
  );
}
