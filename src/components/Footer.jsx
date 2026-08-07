import React from "react";
import { useI18n } from "../i18n";
import { siteConfig } from "../siteConfig";
import { assetUrl } from "../lib/assetUrl";

export default function Footer() {
  const { t } = useI18n();
  const { privacyHref, imprintHref, privacyLabel, imprintLabel } = siteConfig.legal;

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img
          className="wordmark-logo"
          src={assetUrl("brand/alt-bureau.svg")}
          alt={siteConfig.name}
          width="148"
          height="24"
          decoding="async"
        />
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
        <a href={privacyHref}>{privacyLabel}</a>
        <a href={imprintHref}>{imprintLabel}</a>
      </div>
    </footer>
  );
}
