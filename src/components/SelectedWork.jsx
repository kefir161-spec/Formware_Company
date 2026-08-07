import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "../i18n";
import { useReducedMotion } from "../lib/useReducedMotion";
import CaseMedia from "./CaseMedia";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function DualProductCase({ data }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const ease = "power4.out";
      gsap.from(".pf-product", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
      gsap.from(".pf-shot .case-media-el", {
        opacity: 0,
        scale: 1.02,
        duration: 0.85,
        stagger: 0.1,
        ease,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <article className="case-plastfactor" ref={ref}>
      <header className="case-plastfactor-head">
        <p className="mono case-client">{data.client}</p>
        <div className="case-plastfactor-heading">
          <h3>{data.title}</h3>
          <p className="case-summary">{data.summary}</p>
        </div>
      </header>

      <div className="case-plastfactor-products">
        {data.products.map((product) => {
          const showLive = product.live !== false;
          return (
            <article className="pf-product" key={product.title}>
              <p className="pf-status mono">
                {product.status} ·{" "}
                {showLive ? (
                  <span className="pf-live">
                    <i aria-hidden="true" />
                    LIVE
                  </span>
                ) : (
                  <span className="pf-badge">{product.badge || "CODE"}</span>
                )}
              </p>
              <a
                className="pf-shot"
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={product.link}
              >
                <CaseMedia
                  image={product.image}
                  video={product.video}
                  videoWebm={product.videoWebm}
                  title={product.title}
                />
              </a>
              <div className="pf-product-meta">
                <h4>{product.title}</h4>
                <p>{product.text}</p>
                <a className="pf-cta" href={product.href} target="_blank" rel="noopener noreferrer">
                  {product.link}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </article>
  );
}

function CubikCase({ data, localeNote }) {
  const ref = useRef(null);
  const progressRef = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top+=72",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });
      gsap.from(".cubik-feature", {
        opacity: 0,
        x: 24,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 60%" },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <article className="case-cubik" ref={ref}>
      <div className="cubik-progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>
      <div className="case-cubik-layout">
        <div className="case-cubik-sticky">
          <a
            href={data.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={data.link}
            className="cubik-media-link"
          >
            <CaseMedia
              image={data.image}
              video={data.video}
              videoWebm={data.videoWebm}
              title={data.title}
              className="cubik-media"
            />
          </a>
          <p className="locale-note mono">{localeNote}</p>
        </div>
        <div className="case-cubik-copy">
          <p className="mono case-client">{data.client}</p>
          <h3>{data.title}</h3>
          <p className="case-summary">{data.summary}</p>
          <ul className="cubik-features">
            {data.features.map((feature) => (
              <li className="cubik-feature" key={feature.title}>
                <strong>{feature.title}</strong>
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
          <a className="button button-primary" href={data.href} target="_blank" rel="noopener noreferrer">
            {data.link}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function SelectedWork() {
  const { t } = useI18n();

  return (
    <section className="work section" id="work">
      <div className="section-intro work-intro">
        <p className="section-kicker mono">[ {t.work.kicker} ]</p>
        <h2>{t.work.title}</h2>
      </div>
      <DualProductCase data={t.work.plastfactor} />
      <DualProductCase data={t.work.systems} />
      <CubikCase data={t.work.cubik} localeNote={t.work.localeNote} />
    </section>
  );
}
