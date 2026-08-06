import React, { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useI18n } from "../i18n";
import { useReducedMotion } from "../lib/useReducedMotion";
import HeroScene from "./HeroScene";
import HeroCodeBackdrop from "./HeroCodeBackdrop";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const { t } = useI18n();
  const sectionRef = useRef(null);
  const copyRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(copyRef);
      gsap.fromTo(
        q(".hero-mask"),
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.0, ease: "power3.out", stagger: 0.12 },
      );
      gsap.fromTo(
        q(".hero-lead, .hero-actions, .hero-competencies"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.75, delay: 0.35, stagger: 0.08, ease: "power2.out" },
      );
    },
    { scope: copyRef, dependencies: [reduced] },
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) {
      scrollProgressRef.current = 0;
      return undefined;
    }

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const start = rect.height * 0.4;
      const end = rect.height * 1.0;
      const scrolled = Math.max(0, -rect.top);
      scrollProgressRef.current = Math.min(Math.max((scrolled - start) / Math.max(end - start, 1), 0), 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  return (
    <section className="hero" id="top" ref={sectionRef} aria-label={t.a11y.heroScene}>
      <HeroCodeBackdrop />
      <div className="hero-layout">
        <div className="hero-copy" ref={copyRef}>
          <p className="eyebrow">
            <span className="hero-mask">{t.hero.eyebrow}</span>
          </p>
          <h1>
            {t.hero.title.split("\n").map((line) => (
              <span className="hero-mask-line" key={line}>
                <span className="hero-mask">{line}</span>
              </span>
            ))}
          </h1>
          <p className="hero-lead">{t.hero.lead}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">
              {t.hero.primaryCta} <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="button button-ghost" href="#contact">
              {t.hero.secondaryCta}
            </a>
          </div>
          <p className="hero-competencies">
            <span className="mono">{t.hero.competencies}</span>
          </p>
        </div>

        <div className="hero-stage">
          <HeroScene scrollProgressRef={scrollProgressRef} />
        </div>
      </div>
    </section>
  );
}
