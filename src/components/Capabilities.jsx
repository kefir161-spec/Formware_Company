import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { useInView } from "../lib/useInView";
import { useReducedMotion } from "../lib/useReducedMotion";
import { assetUrl } from "../lib/assetUrl";

function CapabilityCard({ card, index, reduced, visible }) {
  const mediaRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const cardEl = cardRef.current;
    const media = mediaRef.current;
    if (!cardEl || !media || reduced) return undefined;

    const onMove = (event) => {
      const rect = cardEl.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      media.style.transform = `translate(${x * 5}px, ${y * 4}px) scale(1.03)`;
    };

    const onLeave = () => {
      media.style.transform = "translate(0, 0) scale(1)";
    };

    cardEl.addEventListener("pointermove", onMove);
    cardEl.addEventListener("pointerleave", onLeave);
    return () => {
      cardEl.removeEventListener("pointermove", onMove);
      cardEl.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <article
      ref={cardRef}
      className={`capability-card${visible ? " is-visible" : ""}`}
      style={{ "--reveal-delay": `${index * 90}ms` }}
    >
      <div className="capability-card-copy">
        <p className="capability-eyebrow mono">{card.eyebrow}</p>
        <h3>{card.title}</h3>
        <p>{card.text}</p>
      </div>
      <div className="capability-card-media" ref={mediaRef}>
        <img
          src={assetUrl(card.image)}
          alt={card.alt}
          loading="lazy"
          decoding="async"
          width={1024}
          height={640}
        />
      </div>
    </article>
  );
}

export default function Capabilities() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { threshold: 0.12, rootMargin: "40px", once: true });
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    if (inView) setVisible(true);
  }, [inView, reduced]);

  return (
    <section className="capabilities section" id="capabilities" ref={sectionRef}>
      <div className="capabilities-head">
        <p className="section-kicker mono">[ {t.capabilities.kicker} ]</p>
        <div className="capabilities-rule" aria-hidden="true" />
      </div>
      <h2 className="capabilities-title">
        {t.capabilities.title.split("\n").map((line, i, arr) => (
          <React.Fragment key={line}>
            {line}
            {i < arr.length - 1 ? <br /> : null}
          </React.Fragment>
        ))}
      </h2>

      <div className="capability-grid">
        {t.capabilities.cards.map((card, index) => (
          <CapabilityCard
            key={card.id}
            card={card}
            index={index}
            reduced={reduced}
            visible={visible}
          />
        ))}
      </div>
    </section>
  );
}
