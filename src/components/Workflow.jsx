import React, { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { useInView } from "../lib/useInView";
import { useReducedMotion } from "../lib/useReducedMotion";

const AUTO_STEP_MS = 2200;
const SCENE_OUT_MS = 220;
const EASE = "cubic-bezier(.22, 1, .36, 1)";

function formatTotal(item, progress) {
  const raw = item.value * progress;
  const value =
    item.decimals > 0 ? raw.toFixed(item.decimals) : String(Math.round(raw));
  const number = item.locale
    ? Number(value).toLocaleString("en-US")
    : value;
  return `${item.prefix || ""}${number}${item.suffix || ""}`;
}

function PartitionProduct({ mode, selected = 2, blocked = null }) {
  const modules = [0, 1, 2, 3];
  const isDrawing = mode === "quote";

  return (
    <svg
      className={`wf-product${isDrawing ? " is-drawing" : ""}`}
      viewBox="0 0 320 200"
      role="img"
      aria-hidden="true"
    >
      <rect className="wf-product-rail" x="24" y="168" width="272" height="8" rx="1" />
      <rect className="wf-product-rail" x="24" y="24" width="272" height="8" rx="1" />
      <rect className="wf-product-post" x="24" y="24" width="10" height="152" />
      <rect className="wf-product-post" x="286" y="24" width="10" height="152" />
      {[1, 2, 3].map((i) => (
        <rect
          key={`post-${i}`}
          className="wf-product-post"
          x={34 + i * 62}
          y="32"
          width="6"
          height="136"
        />
      ))}

      {modules.map((i) => {
        const x = 40 + i * 62;
        const isBlocked = blocked === i;
        return (
          <g
            key={i}
            className={["wf-module", isBlocked ? "is-blocked" : ""].filter(Boolean).join(" ")}
          >
            <rect className="wf-module-frame" x={x} y="36" width="56" height="128" rx="2" />
            <rect className="wf-module-glass" x={x + 6} y="44" width="44" height="72" rx="1" />
            <rect className="wf-module-panel" x={x + 6} y="122" width="44" height="34" rx="1" />
            <line className="wf-module-mullion" x1={x + 28} y1="44" x2={x + 28} y2="116" />
            {isBlocked ? (
              <>
                <line className="wf-module-ban" x1={x + 8} y1="48" x2={x + 48} y2="150" />
                <circle className="wf-module-ban-ring" cx={x + 28} cy="98" r="14" />
                <line className="wf-module-ban-slash" x1={x + 18} y1="88" x2={x + 38} y2="108" />
              </>
            ) : null}
          </g>
        );
      })}

      {mode !== "quote" && mode !== "validate" && selected != null ? (
        <rect
          className="wf-module-focus"
          x={40 + selected * 62 - 3}
          y="33"
          width="62"
          height="134"
          rx="4"
        />
      ) : null}

      {isDrawing ? (
        <g className="wf-dims">
          <line x1="24" y1="188" x2="296" y2="188" />
          <line x1="24" y1="184" x2="24" y2="192" />
          <line x1="296" y1="184" x2="296" y2="192" />
          <text x="160" y="198" textAnchor="middle">
            2400 mm
          </text>
          <line x1="8" y1="24" x2="8" y2="176" />
          <line x1="4" y1="24" x2="12" y2="24" />
          <line x1="4" y1="176" x2="12" y2="176" />
          <text x="14" y="104" transform="rotate(-90 14 104)">
            2100
          </text>
        </g>
      ) : null}
    </svg>
  );
}

function ConfigureScene({ copy }) {
  return (
    <div className="wf-scene-grid">
      <div className="wf-scene-stage" data-stagger="0">
        <PartitionProduct mode="configure" selected={2} />
      </div>
      <aside className="wf-side-panel" data-stagger="1">
        <ul className="wf-params">
          <li>
            <span className="mono">SIZE</span>
            <strong>{copy.size}</strong>
          </li>
          <li className="is-accent">
            <span className="mono">FINISH</span>
            <strong>{copy.material}</strong>
          </li>
          <li>
            <span className="mono">BUILD</span>
            <strong>{copy.modules}</strong>
          </li>
        </ul>
        <div className="wf-controls">
          <button type="button" className="wf-control is-active" tabIndex={-1}>
            {copy.controls.size}
          </button>
          <button type="button" className="wf-control" tabIndex={-1}>
            {copy.controls.material}
          </button>
          <button type="button" className="wf-control" tabIndex={-1}>
            {copy.controls.modules}
          </button>
        </div>
      </aside>
    </div>
  );
}

function ValidateScene({ copy }) {
  return (
    <div className="wf-scene-grid">
      <div className="wf-scene-stage" data-stagger="0">
        <PartitionProduct mode="validate" selected={2} blocked={3} />
      </div>
      <aside className="wf-side-panel" data-stagger="1">
        <ul className="wf-checks">
          {copy.checks.map((check, index) => (
            <li
              key={check.label}
              className={check.status === "BLOCKED" ? "is-blocked" : "is-pass"}
              data-stagger={index + 1}
            >
              <span>{check.label}</span>
              <strong className="mono">{check.status}</strong>
            </li>
          ))}
        </ul>
        <p className="wf-valid-banner mono" data-stagger="5">
          {copy.result}
        </p>
      </aside>
    </div>
  );
}

function PriceScene({ copy, animate }) {
  const [progress, setProgress] = useState(animate ? 0 : 1);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!animate || reduced) {
      setProgress(1);
      return undefined;
    }
    setProgress(0);
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, reduced]);

  return (
    <div className="wf-scene-grid wf-scene-grid--price">
      <div className="wf-scene-stage" data-stagger="0">
        <PartitionProduct mode="price" selected={2} />
      </div>
      <aside className="wf-side-panel" data-stagger="1">
        <table className="wf-bom">
          <tbody>
            {copy.bom.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td className="mono">{Math.round(row.qty * progress)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="wf-totals">
          {copy.totals.map((item) => (
            <li key={item.id}>
              <strong className="mono">{formatTotal(item, progress)}</strong>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function QuoteScene({ copy }) {
  return (
    <div className="wf-scene-grid wf-scene-grid--quote">
      <div className="wf-doc" data-stagger="0">
        <div className="wf-doc-sheet">
          <PartitionProduct mode="quote" />
          <div className="wf-doc-meta mono">
            <span>{copy.bom}</span>
            <span>{copy.pdf}</span>
          </div>
        </div>
      </div>
      <aside className="wf-side-panel wf-quote-card" data-stagger="1">
        <p className="wf-quote-id mono">{copy.quote}</p>
        <ul className="wf-quote-lines">
          <li>
            <span>Frames</span>
            <span className="mono">4</span>
          </li>
          <li>
            <span>Panels</span>
            <span className="mono">8</span>
          </li>
          <li>
            <span>Shelves</span>
            <span className="mono">2</span>
          </li>
          <li className="is-total">
            <span>Total</span>
            <span className="mono">€2,840</span>
          </li>
        </ul>
        <div className="wf-order-ready" data-stagger="2">
          <span className="wf-order-dot" aria-hidden="true" />
          <strong className="mono">{copy.order}</strong>
        </div>
      </aside>
    </div>
  );
}

function SceneBody({ step, copy, animatePrice }) {
  switch (step) {
    case 0:
      return <ConfigureScene copy={copy.configure} />;
    case 1:
      return <ValidateScene copy={copy.validate} />;
    case 2:
      return <PriceScene copy={copy.price} animate={animatePrice} />;
    case 3:
      return <QuoteScene copy={copy.quote} />;
    default:
      return null;
  }
}

export default function Workflow() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const tabRefs = useRef([]);
  const inView = useInView(sectionRef, { threshold: 0.28, once: true });
  const baseId = useId();

  const [active, setActive] = useState(0);
  const [displayStep, setDisplayStep] = useState(0);
  const [phase, setPhase] = useState("in");
  const [userLocked, setUserLocked] = useState(false);
  const [animatePrice, setAnimatePrice] = useState(false);
  const autoDoneRef = useRef(false);

  const pipeline = t.workflow.pipeline;

  const selectStep = (index, fromUser = false) => {
    if (fromUser) setUserLocked(true);
    setActive(index);
  };

  useEffect(() => {
    if (active === displayStep) {
      setPhase("in");
      return undefined;
    }
    if (reduced) {
      setDisplayStep(active);
      setPhase("in");
      setAnimatePrice(active === 2);
      return undefined;
    }
    setPhase("out");
    const timer = window.setTimeout(() => {
      setDisplayStep(active);
      setPhase("in");
      setAnimatePrice(active === 2);
    }, SCENE_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [active, displayStep, reduced]);

  useEffect(() => {
    if (!inView || reduced || userLocked || autoDoneRef.current) return undefined;

    let step = 0;
    const timers = [];

    const schedule = () => {
      if (step >= pipeline.length - 1) {
        autoDoneRef.current = true;
        return;
      }
      timers.push(
        window.setTimeout(() => {
          step += 1;
          setActive(step);
          schedule();
        }, AUTO_STEP_MS),
      );
    };

    schedule();
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, reduced, userLocked, pipeline.length]);

  const onTabKeyDown = (event, index) => {
    const last = pipeline.length - 1;
    let next = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    selectStep(next, true);
    tabRefs.current[next]?.focus();
  };

  const progress = ((active + 1) / pipeline.length) * 100;

  return (
    <section className="workflow section-dark" id="workflow" ref={sectionRef}>
      <div className="workflow-inner">
        <div className="workflow-copy">
          <p className="section-kicker mono">{t.workflow.kicker}</p>
          <h2>{t.workflow.title}</h2>
          <ul className="workflow-problems">
            {t.workflow.problems.map((item, index) => (
              <li key={item}>
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="workflow-panel" aria-label={t.a11y.workflowDiagram}>
          <div className="workflow-pipeline-wrap">
            <div
              className="workflow-pipeline"
              role="tablist"
              aria-label={t.a11y.workflowTabs}
            >
              {pipeline.map((step, index) => (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${step.id}`}
                    aria-selected={active === index}
                    aria-controls={`${baseId}-panel-${step.id}`}
                    tabIndex={active === index ? 0 : -1}
                    className={`pipeline-node${active === index ? " is-active" : ""}`}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    onClick={() => selectStep(index, true)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                  >
                    <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step.label}</strong>
                  </button>
                  {index < pipeline.length - 1 ? (
                    <span className="pipeline-arrow" aria-hidden="true" />
                  ) : null}
                </React.Fragment>
              ))}
            </div>
            <div className="workflow-progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div
            className="workflow-panel-body"
            role="tabpanel"
            id={`${baseId}-panel-${pipeline[displayStep].id}`}
            aria-labelledby={`${baseId}-tab-${pipeline[displayStep].id}`}
          >
            <p className="wf-scene-title">{pipeline[displayStep].title}</p>
            <div
              className={`workflow-scene is-${phase}${reduced ? " is-reduced" : ""}`}
              style={{ transitionTimingFunction: EASE }}
            >
              <SceneBody
                step={displayStep}
                copy={t.workflow}
                animatePrice={animatePrice && displayStep === 2}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="workflow-strip">
        <p>{t.workflow.strip.text}</p>
        <ul>
          {t.workflow.strip.points.map((item) => (
            <li key={item} className="mono">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
