import React, { useMemo } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

/** Product-logic snippets — reads as configurator / BOM / quote work. */
const SNIPPETS = [
  "rule: width >= 1200 → profile.XL",
  "price = base + bom.sum()",
  "configure(void_frame)",
  "option.glass → recalc()",
  "dealer.quote(locale)",
  "export → STEP | DXF | PDF",
  "if hinge.side == L then mirror",
  "bom.push(sku, qty)",
  "constraint: max_span = 3.2m",
  "3d.update(params)",
  "pricing.tier(volume)",
  "validate(product_rules)",
  "customer.select(finish)",
  "calc.area * rate.sheet",
  "sync.erp(order_id)",
  "mesh.explode(faces)",
  "rule: corner → join.45",
  "quote.ttl = 14d",
  "variant = A | B | C",
  "render.preview(lod=2)",
  "lock.param('height')",
  "sales.apply(discount)",
  "BOM.line('ALU-204')",
  "logic.graph.resolve()",
];

function buildColumns(count) {
  const cols = [];
  for (let c = 0; c < count; c += 1) {
    const len = 10 + ((c * 3) % 5);
    const lines = [];
    for (let i = 0; i < len; i += 1) {
      lines.push(SNIPPETS[(c * 7 + i * 3) % SNIPPETS.length]);
    }
    cols.push(lines);
  }
  return cols;
}

function CodeColumn({ lines, index, animate }) {
  const duration = 18 + (index % 5) * 4;
  const delay = -(index * 3.1);
  const accentEvery = 2 + (index % 2);

  const track = (
    <>
      {lines.map((line, i) => (
        <span
          key={`${line}-${i}`}
          className={i % accentEvery === 0 ? "hero-code-line is-accent" : "hero-code-line"}
        >
          {line}
        </span>
      ))}
    </>
  );

  return (
    <div
      className="hero-code-col"
      style={
        animate
          ? { "--code-dur": `${duration}s`, "--code-delay": `${delay}s` }
          : undefined
      }
    >
      <div className={`hero-code-track${animate ? " is-running" : ""}`}>
        {track}
        {animate ? track : null}
      </div>
    </div>
  );
}

export default function HeroCodeBackdrop() {
  const reduced = useReducedMotion();
  const columns = useMemo(() => buildColumns(7), []);

  return (
    <div className="hero-code" aria-hidden="true">
      <div className="hero-code-grid">
        {columns.map((lines, index) => (
          <CodeColumn key={index} lines={lines} index={index} animate={!reduced} />
        ))}
      </div>
    </div>
  );
}
