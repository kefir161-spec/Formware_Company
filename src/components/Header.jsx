import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useI18n } from "../i18n";
import { siteConfig } from "../siteConfig";

export default function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <a href="#top" className="wordmark" onClick={close} aria-label={t.a11y.home}>
        <span className="mark" aria-hidden="true">
          F
        </span>
        <span>{siteConfig.name}</span>
      </a>

      <div className="header-actions">
        <button
          type="button"
          className="menu-button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={t.a11y.toggleMenu}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav
        id="main-nav"
        className={open ? "main-nav is-open" : "main-nav"}
        aria-label={t.a11y.mainNav}
      >
        {siteConfig.nav.map((item) => (
          <a key={item.id} href={item.href} onClick={close}>
            {t.nav[item.labelKey]}
          </a>
        ))}
        <a className="nav-cta" href={siteConfig.cta.href} onClick={close}>
          {t.nav[siteConfig.cta.labelKey]} <ArrowRight size={16} aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
