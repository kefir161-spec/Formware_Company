import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowRight,
  Box,
  Calculator,
  Check,
  ChevronRight,
  CircleDot,
  Database,
  Menu,
  MousePointer2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import * as THREE from "three";
import { I18nProvider, useI18n } from "./i18n";
import "./styles.css";

const SOLUTION_ICONS = [Box, Calculator, Database, MousePointer2];

function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(4.8, 4, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8f918a, 3));
    const key = new THREE.DirectionalLight(0xffffff, 5);
    key.position.set(3, 7, 5);
    key.castShadow = true;
    scene.add(key);

    const group = new THREE.Group();
    group.rotation.set(-0.05, -0.32, -0.03);
    scene.add(group);

    const metal = new THREE.MeshStandardMaterial({ color: 0xbcc0bc, metalness: 0.76, roughness: 0.22 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x222320, metalness: 0.3, roughness: 0.35 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x858a84, metalness: 0.05, roughness: 0.75 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x315cff, metalness: 0.18, roughness: 0.34 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 3.45), metal);
    base.position.y = -0.2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const inset = new THREE.Mesh(new THREE.BoxGeometry(4.72, 0.16, 2.98), dark);
    inset.position.y = -0.01;
    inset.castShadow = true;
    group.add(inset);

    const tileGeo = new THREE.BoxGeometry(0.88, 0.16, 0.82);
    for (let x = -2; x <= 2; x += 1) {
      for (let z = -1; z <= 1; z += 1) {
        const tile = new THREE.Mesh(tileGeo, (x === 1 && z === 0) || (x === 0 && z === 1) ? accentMat : rubber);
        tile.position.set(x * 0.94, 0.14, z * 0.9);
        tile.castShadow = true;
        group.add(tile);
      }
    }

    const railGeo = new THREE.BoxGeometry(5.55, 0.25, 0.15);
    [-1.82, 1.82].forEach((z) => {
      const rail = new THREE.Mesh(railGeo, metal);
      rail.position.set(0, 0.16, z);
      rail.castShadow = true;
      group.add(rail);
    });

    const sideRailGeo = new THREE.BoxGeometry(0.15, 0.25, 3.5);
    [-2.72, 2.72].forEach((x) => {
      const rail = new THREE.Mesh(sideRailGeo, metal);
      rail.position.set(x, 0.16, 0);
      rail.castShadow = true;
      group.add(rail);
    });

    const markerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x315cff, emissiveIntensity: 0.35 });
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24), markerMat);
    marker.position.set(0.94, 0.32, 0);
    group.add(marker);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.11 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.1;
    floor.receiveShadow = true;
    scene.add(floor);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frame;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      if (!reduceMotion) {
        group.rotation.y += (pointer.x * 0.14 - 0.32 - group.rotation.y) * 0.035;
        group.rotation.x += (-pointer.y * 0.07 - 0.05 - group.rotation.x) * 0.035;
        group.position.y = Math.sin(t * 0.8) * 0.06;
        marker.position.y = 0.32 + Math.sin(t * 2.2) * 0.035;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      scene.traverse((item) => {
        if (item.geometry) item.geometry.dispose();
        if (item.material) {
          const mats = Array.isArray(item.material) ? item.material : [item.material];
          mats.forEach((mat) => mat.dispose());
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="hero-canvas" ref={mountRef} aria-hidden="true" />;
}

function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <a href="#top" className="wordmark" onClick={close} aria-label={t.a11y.home}>
        <span className="mark">S</span>
        <span>SOFTWARE</span>
      </a>
      <div className="header-actions">
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={t.a11y.toggleMenu}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav className={open ? "main-nav is-open" : "main-nav"} aria-label={t.a11y.mainNav}>
        <a href="#work" onClick={close}>{t.nav.work}</a>
        <a href="#solutions" onClick={close}>{t.nav.solutions}</a>
        <a href="#approach" onClick={close}>{t.nav.approach}</a>
        <a href="#market-test" onClick={close}>{t.nav.marketTest}</a>
        <a className="nav-cta" href="#contact" onClick={close}>{t.nav.discussProject} <ArrowRight size={16} /></a>
      </nav>
    </header>
  );
}

function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add("is-visible");
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function ConfiguratorVisual() {
  const { t } = useI18n();
  const [active, setActive] = useState(1);
  return (
    <div className="product-ui configurator-ui" aria-label={t.a11y.configuratorPreview}>
      <div className="ui-top"><span>PF / CONFIGURE</span><span className="live-dot">{t.ui.live}</span></div>
      <div className="config-body">
        <div className="config-rail">
          <span className="ui-label">{t.ui.profile}</span>
          {["AL-20", "AL-42", "AL-60"].map((item, index) => (
            <button key={item} onClick={() => setActive(index)} className={active === index ? "active" : ""}>{item}</button>
          ))}
          <span className="ui-label">{t.ui.finish}</span>
          <div className="swatches"><i /><i /><i /></div>
        </div>
        <div className="config-product">
          <div className={`profile profile-${active}`}><i /><b /><span /></div>
          <div className="measure measure-x">1200 mm</div>
          <div className="measure measure-y">800 mm</div>
        </div>
      </div>
      <div className="ui-footer"><span>{t.ui.configValid}</span><strong>{t.ui.generateQuote} <ChevronRight size={15} /></strong></div>
    </div>
  );
}

function FlooringVisual() {
  const { t } = useI18n();
  const [material, setMaterial] = useState("blue");
  return (
    <div className="product-ui flooring-ui" aria-label={t.a11y.flooringPreview}>
      <div className="ui-top"><span>{t.ui.room}</span><span>74.8 M²</span></div>
      <div className="floor-stage">
        <div className={`floor-grid material-${material}`}>
          {Array.from({ length: 48 }, (_, index) => <i key={index} className={index % 9 === 0 ? "marked" : ""} />)}
        </div>
        <div className="floor-panel">
          <span className="ui-label">{t.ui.material}</span>
          <button className={material === "blue" ? "active" : ""} onClick={() => setMaterial("blue")}>{t.ui.materials[0]}</button>
          <button className={material === "lime" ? "active" : ""} onClick={() => setMaterial("lime")}>{t.ui.materials[1]}</button>
          <span className="ui-label">{t.ui.output}</span>
          <strong>186 {t.ui.tiles}</strong><small>12 {t.ui.edgeProfiles}</small>
        </div>
      </div>
    </div>
  );
}

function CrmVisual() {
  const { t } = useI18n();
  return (
    <div className="product-ui crm-ui" aria-label={t.a11y.crmPreview}>
      <div className="crm-sidebar"><span className="mini-mark">S</span><i className="active" /><i /><i /><i /></div>
      <div className="crm-main">
        <div className="ui-top"><span>{t.ui.ordersActive}</span><button>{t.ui.newOrder}</button></div>
        <div className="crm-metrics">
          <div><small>{t.ui.metrics.openQuotes}</small><strong>24</strong></div>
          <div><small>{t.ui.metrics.inProduction}</small><strong>11</strong></div>
          <div><small>{t.ui.metrics.waiting}</small><strong>06</strong></div>
        </div>
        <div className="crm-table">
          {t.ui.crmRows.map((row, index) => (
            <div key={row.company}>
              <span>{row.company}</span>
              <span><i className={`status status-${index}`} />{row.status}</span>
              <span>{row.date}</span>
              <ChevronRight size={14} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main id="top">
      <Header />
      <section className="hero">
        <HeroScene />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow"><CircleDot size={15} /> {t.hero.eyebrow}</p>
          <h1>{t.hero.title}<br /><span>{t.hero.titleAccent}</span></h1>
          <p className="hero-lead">{t.hero.lead}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">{t.hero.discussProject} <ArrowRight size={18} /></a>
            <a className="text-link" href="#work">{t.hero.viewWork} <ArrowDown size={17} /></a>
          </div>
        </div>
        <div className="hero-meta">{t.hero.meta.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <section className="signal-strip" aria-label={t.a11y.capabilities}>
        {t.signal.map(({ tag, text }) => <div key={tag}><span>{tag}</span> {text}</div>)}
      </section>

      <section className="work section" id="work">
        <Reveal className="section-intro">
          <p className="section-kicker">{t.work.kicker}</p>
          <h2>{t.work.title}</h2>
        </Reveal>

        <article className="case case-light">
          <Reveal className="case-copy">
            <p className="case-index">{t.work.cases[0].index}</p>
            <h3>{t.work.cases[0].title}</h3>
            <p>{t.work.cases[0].text}</p>
            <div className="case-tags">{t.work.cases[0].tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <a href="#contact">{t.work.cases[0].link} <ArrowRight size={17} /></a>
          </Reveal>
          <Reveal className="case-visual"><ConfiguratorVisual /></Reveal>
        </article>

        <article className="case case-blue">
          <Reveal className="case-copy">
            <p className="case-index">{t.work.cases[1].index}</p>
            <h3>{t.work.cases[1].title}</h3>
            <p>{t.work.cases[1].text}</p>
            <div className="case-tags">{t.work.cases[1].tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <a href="#contact">{t.work.cases[1].link} <ArrowRight size={17} /></a>
          </Reveal>
          <Reveal className="case-visual"><FlooringVisual /></Reveal>
        </article>

        <article className="case case-dark">
          <Reveal className="case-copy">
            <p className="case-index">{t.work.cases[2].index}</p>
            <h3>{t.work.cases[2].title}</h3>
            <p>{t.work.cases[2].text}</p>
            <div className="case-tags">{t.work.cases[2].tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <a href="#custom-software">{t.work.cases[2].link} <ArrowRight size={17} /></a>
          </Reveal>
          <Reveal className="case-visual"><CrmVisual /></Reveal>
        </article>
      </section>

      <section className="solutions section" id="solutions">
        <Reveal className="section-intro split-intro">
          <p className="section-kicker">{t.solutions.kicker}</p>
          <h2>{t.solutions.title}</h2>
          <p>{t.solutions.lead}</p>
        </Reveal>
        <div className="solution-list">
          {t.solutions.items.map(({ num, title, text }, index) => {
            const Icon = SOLUTION_ICONS[index];
            return (
              <Reveal className="solution-row" key={title}>
                <span className="solution-num">{num}</span>
                <Icon size={25} strokeWidth={1.6} />
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowRight className="solution-arrow" />
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="friction section-dark">
        <Reveal className="friction-heading">
          <p className="section-kicker">{t.friction.kicker}</p>
          <h2>{t.friction.title}</h2>
        </Reveal>
        <div className="friction-grid">
          {t.friction.items.map((item, index) => (
            <Reveal key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></Reveal>
          ))}
        </div>
        <Reveal className="friction-outcome"><Sparkles size={23} /><p>{t.friction.outcome}</p></Reveal>
      </section>

      <section className="custom section" id="custom-software">
        <Reveal className="custom-heading">
          <p className="section-kicker">{t.custom.kicker}</p>
          <h2>{t.custom.title} <em>{t.custom.titleAccent}</em></h2>
        </Reveal>
        <div className="custom-layout">
          <Reveal className="custom-copy">
            <p>{t.custom.lead}</p>
            <ul>
              {t.custom.benefits.map((item) => <li key={item}><Check /> {item}</li>)}
            </ul>
            <a className="button button-dark" href="#contact">{t.custom.cta} <ArrowRight size={18} /></a>
          </Reveal>
          <Reveal className="ownership-panel">
            <div className="panel-head"><span>{t.custom.panel.yourWorkflow}</span><span>{t.custom.panel.softwareSystem}</span></div>
            {t.custom.panel.items.map((item, index) => (
              <div className="flow-row" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{item}</b>
                <ArrowRight size={17} />
                <i>{t.custom.panel.active}</i>
              </div>
            ))}
            <div className="panel-foot"><Database size={17} /><span>{t.custom.panel.foot}</span></div>
          </Reveal>
        </div>
      </section>

      <section className="market section" id="market-test">
        <div className="market-grid">
          <Reveal className="market-copy">
            <p className="section-kicker">{t.market.kicker}</p>
            <h2>{t.market.title}</h2>
            <p>{t.market.lead}</p>
            <a className="button button-dark" href="#contact">{t.market.cta} <ArrowRight size={18} /></a>
          </Reveal>
          <Reveal className="market-timeline">
            <div className="timeline-top"><span>{t.market.timeline.top}</span><strong>{t.market.timeline.duration}</strong></div>
            {t.market.timeline.steps.map((step, index) => (
              <div className="timeline-row" key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{step.title}</b><small>{step.desc}</small></div>
                {index < 2 ? <Check /> : <CircleDot />}
              </div>
            ))}
            <div className="timeline-note">{t.market.timeline.note}</div>
          </Reveal>
        </div>
      </section>

      <section className="approach section" id="approach">
        <Reveal className="section-intro split-intro">
          <p className="section-kicker">{t.approach.kicker}</p>
          <h2>{t.approach.title}</h2>
          <p>{t.approach.lead}</p>
        </Reveal>
        <div className="process-grid">
          {t.approach.steps.map(({ num, title, text }) => (
            <Reveal className="process-step" key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></Reveal>
          ))}
        </div>
        <Reveal className="support-bar">
          {t.approach.support.map((item) => <div key={item}><CircleDot /><span>{item}</span></div>)}
        </Reveal>
      </section>

      <section className="contact section-dark" id="contact">
        <div className="contact-layout">
          <Reveal className="contact-copy">
            <p className="section-kicker">{t.contact.kicker}</p>
            <h2>{t.contact.title}</h2>
            <p>{t.contact.lead}</p>
            <a href="mailto:hello@software.eu">hello@software.eu <ArrowRight size={17} /></a>
          </Reveal>
          <Reveal>
            {sent ? (
              <div className="form-success">
                <Check size={30} />
                <h3>{t.contact.success.title}</h3>
                <p>{t.contact.success.text}</p>
                <button onClick={() => setSent(false)}>{t.contact.success.again}</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submit}>
                <label><span>{t.contact.form.name}</span><input name="name" required placeholder={t.contact.form.namePlaceholder} /></label>
                <label><span>{t.contact.form.email}</span><input name="email" required type="email" placeholder={t.contact.form.emailPlaceholder} /></label>
                <label className="full"><span>{t.contact.form.message}</span><textarea name="message" required rows="4" placeholder={t.contact.form.messagePlaceholder} /></label>
                <button className="button button-lime" type="submit">{t.contact.form.submit} <Send size={17} /></button>
                <small>{t.contact.form.consent}</small>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="footer-mark"><span className="mark">S</span><strong>SOFTWARE</strong></div>
        <p>{t.footer.tagline}</p>
        <div>
          <a href="#work">{t.nav.work}</a>
          <a href="#solutions">{t.nav.solutions}</a>
          <a href="#market-test">{t.nav.marketTest}</a>
          <a href="#contact">{t.nav.contact}</a>
        </div>
        <span>{t.footer.region}</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);
