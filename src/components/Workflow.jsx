import React, { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { useInView } from "../lib/useInView";
import { useReducedMotion } from "../lib/useReducedMotion";

const AUTO_STEP_MS = 2000;
const TRANSITION_MS = 650;
const STAGE_IDS = ["sales", "engineering", "approval", "production"];

function DocThumb({ label }) {
  return (
    <div className="ops-doc-thumb">
      <svg viewBox="0 0 48 56" aria-hidden="true">
        <rect x="4" y="2" width="36" height="48" rx="3" className="ops-doc-sheet" />
        <path d="M28 2v12h12" className="ops-doc-fold" />
        <line x1="12" y1="24" x2="32" y2="24" />
        <line x1="12" y1="30" x2="28" y2="30" />
        <line x1="12" y1="36" x2="30" y2="36" />
      </svg>
      <span className="mono">{label}</span>
    </div>
  );
}

function TechDrawing() {
  return (
    <svg className="ops-drawing" viewBox="0 0 280 160" role="img" aria-hidden="true">
      <rect x="36" y="28" width="208" height="96" className="ops-draw-frame" />
      <line x1="36" y1="76" x2="244" y2="76" className="ops-draw-guide" />
      <line x1="140" y1="28" x2="140" y2="124" className="ops-draw-guide" />
      <rect x="52" y="40" width="72" height="28" className="ops-draw-panel" />
      <rect x="156" y="40" width="72" height="28" className="ops-draw-panel" />
      <rect x="52" y="84" width="72" height="28" className="ops-draw-panel" />
      <rect x="156" y="84" width="72" height="28" className="ops-draw-panel" />
      <line x1="36" y1="140" x2="244" y2="140" className="ops-draw-dim" />
      <line x1="36" y1="136" x2="36" y2="144" className="ops-draw-dim" />
      <line x1="244" y1="136" x2="244" y2="144" className="ops-draw-dim" />
      <text x="140" y="154" textAnchor="middle" className="ops-draw-label">
        1800
      </text>
      <line x1="20" y1="28" x2="20" y2="124" className="ops-draw-dim" />
      <line x1="16" y1="28" x2="24" y2="28" className="ops-draw-dim" />
      <line x1="16" y1="124" x2="24" y2="124" className="ops-draw-dim" />
      <text x="10" y="80" textAnchor="middle" className="ops-draw-label" transform="rotate(-90 10 80)">
        900
      </text>
    </svg>
  );
}

function CheckIcon({ drawn }) {
  return (
    <svg className={`ops-check${drawn ? " is-drawn" : ""}`} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" className="ops-check-ring" />
      <path className="ops-check-path" d="M4.5 8.2l2.4 2.4 4.6-5" fill="none" />
    </svg>
  );
}

function StageContent({ stage, copy, reduced }) {
  const sales = copy.stages.sales;
  const engineering = copy.stages.engineering;
  const approval = copy.stages.approval;
  const production = copy.stages.production;

  if (stage === "sales") {
    return (
      <div className="ops-stage-body">
        <article className="ops-order-card" data-stagger="0">
          <header className="ops-order-card-head">
            <span className="mono">{sales.orderId}</span>
            <span className="ops-badge ops-badge--blue mono">{sales.badge}</span>
          </header>
          <dl className="ops-fields">
            {sales.fields.map((field) => (
              <div key={field.label} data-stagger="1">
                <dt className="mono">{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        </article>
        <div className="ops-doc-row" data-stagger="2">
          {sales.docs.map((doc) => (
            <DocThumb key={doc} label={doc} />
          ))}
        </div>
      </div>
    );
  }

  if (stage === "engineering") {
    return (
      <div className="ops-stage-body ops-stage-body--split">
        <article className="ops-detail-card" data-stagger="0">
          <ul className="ops-meta-list">
            {engineering.meta.map((row) => (
              <li key={row.label} data-stagger="1">
                <span className="mono">{row.label}</span>
                <strong>{row.value}</strong>
              </li>
            ))}
          </ul>
        </article>
        <aside className="ops-drawing-panel" data-stagger="2">
          <p className="mono ops-panel-label">{engineering.drawingLabel}</p>
          <TechDrawing />
        </aside>
      </div>
    );
  }

  if (stage === "approval") {
    return (
      <div className="ops-stage-body ops-stage-body--split">
        <article className="ops-approval-card" data-stagger="0">
          <p className="mono ops-panel-label">{approval.matrixLabel}</p>
          <ul className="ops-approval-matrix">
            {approval.parties.map((party, index) => (
              <li
                key={party}
                className="is-approved"
                data-stagger={index + 1}
                style={
                  reduced
                    ? undefined
                    : { "--ops-check-delay": `${180 + index * 140}ms` }
                }
              >
                <span>{party}</span>
                <CheckIcon drawn={!reduced} />
                <span className="visually-hidden">{approval.approvedLabel}</span>
              </li>
            ))}
          </ul>
        </article>
        <aside className="ops-detail-card" data-stagger="4">
          <ul className="ops-meta-list">
            {approval.meta.map((row) => (
              <li key={row.label}>
                <span className="mono">{row.label}</span>
                <strong>{row.value}</strong>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    );
  }

  return (
    <div className="ops-stage-body ops-stage-body--split">
      <article className="ops-detail-card" data-stagger="0">
        <ul className="ops-meta-list">
          {production.meta.map((row) => (
            <li key={row.label} data-stagger="1">
              <span className="mono">{row.label}</span>
              <strong>{row.value}</strong>
            </li>
          ))}
        </ul>
        <div className="ops-ready-pill mono" data-stagger="2">
          <span className="ops-ready-dot" aria-hidden="true" />
          {production.ready}
        </div>
      </article>
      <aside className="ops-doc-stack" data-stagger="3">
        <p className="mono ops-panel-label">{production.docsLabel}</p>
        <div className="ops-doc-row">
          {production.docs.map((doc, index) => (
            <div
              key={doc}
              className="ops-stack-item"
              style={{ "--ops-stack-i": index }}
              data-stagger={index + 1}
            >
              <DocThumb label={doc} />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default function Workflow() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const stageRefs = useRef([]);
  const inView = useInView(sectionRef, { threshold: 0.15, once: true });
  const baseId = useId();

  const [active, setActive] = useState(0);
  const [displayStep, setDisplayStep] = useState(0);
  const [statusStep, setStatusStep] = useState(0);
  const [phase, setPhase] = useState("in");
  const [userLocked, setUserLocked] = useState(false);
  const [statusReady, setStatusReady] = useState(true);
  const mountedRef = useRef(false);

  const copy = t.workflow;
  const stages = copy.pipeline;
  const statusStage = stages[statusStep];
  const displayStage = stages[displayStep];

  const selectStep = (index, fromUser = false) => {
    if (fromUser) setUserLocked(true);
    setActive(index);
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return undefined;
    }

    if (reduced) {
      setDisplayStep(active);
      setStatusStep(active);
      setPhase("in");
      setStatusReady(true);
      return undefined;
    }

    let cancelled = false;
    setPhase("out");
    setStatusReady(false);

    const swapTimer = window.setTimeout(() => {
      if (cancelled) return;
      setDisplayStep(active);
      setPhase("in");
    }, Math.round(TRANSITION_MS * 0.38));

    const statusTimer = window.setTimeout(() => {
      if (cancelled) return;
      setStatusStep(active);
      setStatusReady(true);
    }, TRANSITION_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(swapTimer);
      window.clearTimeout(statusTimer);
    };
  }, [active, reduced]);

  useEffect(() => {
    if (!inView || reduced || userLocked) return undefined;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % stages.length);
    }, AUTO_STEP_MS);

    return () => window.clearInterval(timer);
  }, [inView, reduced, userLocked, stages.length]);

  const onStageKeyDown = (event, index) => {
    const last = stages.length - 1;
    let next = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = index === last ? 0 : index + 1;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = index === 0 ? last : index - 1;
    }
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    selectStep(next, true);
    stageRefs.current[next]?.focus();
  };

  const progressPct = (active / (stages.length - 1)) * 100;
  const statusTone =
    statusStage.id === "production" || statusStage.id === "approval"
      ? "is-success"
      : "is-live";

  return (
    <section className="workflow section-dark" id="workflow" ref={sectionRef}>
      <header className="ops-intro">
        <div className="ops-intro-main">
          <p className="section-kicker mono">{copy.kicker}</p>
          <h2>{copy.title}</h2>
        </div>
        <p className="ops-intro-lead">{copy.lead}</p>
      </header>

      <div
        className="ops-shell"
        aria-label={t.a11y.workflowDiagram}
      >
        <aside className="ops-sidebar" aria-hidden="true">
          <p className="ops-brand mono">{copy.app.brand}</p>
          <nav className="ops-nav">
            {copy.app.nav.map((item) => (
              <span
                key={item.id}
                className={`ops-nav-item${item.id === "orders" ? " is-active" : ""}`}
              >
                {item.label}
              </span>
            ))}
          </nav>
        </aside>

        <div className="ops-main">
          <div className="ops-topbar">
            <div className="ops-topbar-copy">
              <p className="mono ops-topbar-eyebrow">{copy.app.eyebrow}</p>
              <h3>{copy.app.orderTitle}</h3>
            </div>
            <span
              className={`ops-status mono ${statusTone}${statusReady ? " is-ready" : ""}`}
              aria-live="polite"
            >
              {statusStage.statusLabel}
            </span>
          </div>

          <div className="ops-track-wrap">
            <div
              className="ops-track"
              role="tablist"
              aria-label={t.a11y.workflowTabs}
            >
              <div className="ops-track-line" aria-hidden="true">
                <span
                  className="ops-track-progress"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {stages.map((stage, index) => {
                const isActive = active === index;
                const isDone = index < active;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${stage.id}`}
                    aria-selected={isActive}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={isActive ? 0 : -1}
                    className={[
                      "ops-stage",
                      isActive ? "is-active" : "",
                      isDone ? "is-done" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    ref={(node) => {
                      stageRefs.current[index] = node;
                    }}
                    onClick={() => selectStep(index, true)}
                    onKeyDown={(event) => onStageKeyDown(event, index)}
                  >
                    <span className="ops-stage-dot" aria-hidden="true">
                      {isDone ? <CheckIcon drawn /> : null}
                    </span>
                    <strong>{stage.label}</strong>
                    <span className="visually-hidden">
                      {isActive
                        ? copy.a11y.active
                        : isDone
                          ? copy.a11y.completed
                          : copy.a11y.upcoming}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="ops-workspace"
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${displayStage.id}`}
          >
            <div className="ops-workspace-head">
              <p className="mono ops-stage-status">{displayStage.headline}</p>
            </div>
            <div
              className={`ops-workspace-body is-${phase}${reduced ? " is-reduced" : ""}`}
              key={displayStage.id}
            >
              <StageContent
                stage={STAGE_IDS[displayStep]}
                copy={copy}
                reduced={reduced}
              />
            </div>
          </div>
        </div>
      </div>

      <ul className="ops-proof">
        {copy.proof.map((item, index) => (
          <li key={item}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <strong className="mono">{item}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
