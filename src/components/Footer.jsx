import React from "react";
import { useI18n } from "../i18n";
import { siteConfig } from "../siteConfig";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="mark" aria-hidden="true">
          F
        </span>
        <strong>{siteConfig.name}</strong>
      </div>
      <p>{t.footer.tagline}</p>
      <nav aria-label="Footer">
        {siteConfig.nav.map((item) => (
          <a key={item.id} href={item.href}>
            {t.nav[item.labelKey]}
          </a>
        ))}
      </nav>
      <div className="footer-meta">
        <span>{t.footer.region}</span>
        {siteConfig.legal.privacyHref ? (
          <a href={siteConfig.legal.privacyHref}>{siteConfig.legal.privacyLabel}</a>
        ) : (
          <span className="legal-placeholder">{siteConfig.legal.privacyLabel}</span>
        )}
        {siteConfig.legal.imprintHref ? (
          <a href={siteConfig.legal.imprintHref}>{siteConfig.legal.imprintLabel}</a>
        ) : (
          <span className="legal-placeholder">{siteConfig.legal.imprintLabel}</span>
        )}
      </div>
    </footer>
  );
}
