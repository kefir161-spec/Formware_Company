import React, { useEffect } from "react";
import { siteConfig } from "../siteConfig";
import { assetUrl } from "../lib/assetUrl";
import { useI18n } from "../i18n";

function LegalShell({ title, children, updated }) {
  const { t } = useI18n();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="legal-page">
      <header className="legal-top">
        <a className="legal-brand" href="#/" aria-label={t.a11y.home}>
          <img
            className="wordmark-logo"
            src={assetUrl("brand/alt-bureau.svg")}
            alt={siteConfig.name}
            width="148"
            height="24"
            decoding="async"
          />
        </a>
        <a className="legal-back" href="#/">
          {t.legal.backHome}
        </a>
      </header>
      <article className="legal-doc">
        <p className="mono legal-kicker">{t.legal.kicker}</p>
        <h1>{title}</h1>
        {updated ? <p className="legal-updated">{updated}</p> : null}
        <div className="legal-body">{children}</div>
      </article>
    </div>
  );
}

export function PrivacyPage() {
  const { t } = useI18n();
  const p = t.legal.privacy;

  return (
    <LegalShell title={p.title} updated={p.updated}>
      {p.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          {section.list ? (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
      <p>
        {p.contactLead}{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </p>
    </LegalShell>
  );
}

export function ImprintPage() {
  const { t } = useI18n();
  const im = t.legal.imprint;
  const legal = siteConfig.legal;
  const addressLines = Array.isArray(legal.addressLines)
    ? legal.addressLines.filter(Boolean)
    : [];

  return (
    <LegalShell title={im.title} updated={im.updated}>
      <section>
        <h2>{im.providerHeading}</h2>
        <p>
          <strong>{legal.operator || siteConfig.name}</strong>
        </p>
        {legal.responsible ? (
          <p>
            {im.responsibleLabel}: {legal.responsible}
          </p>
        ) : null}
        {addressLines.length > 0 ? (
          <p>
            {addressLines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
        ) : null}
        {legal.companyRegister ? (
          <p>
            {im.registerLabel}: {legal.companyRegister}
          </p>
        ) : null}
        {legal.vatId ? (
          <p>
            {im.vatLabel}: {legal.vatId}
          </p>
        ) : null}
      </section>

      <section>
        <h2>{im.contactHeading}</h2>
        <p>
          {im.emailLabel}:{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </p>
        {siteConfig.telegram?.href ? (
          <p>
            {im.telegramLabel}:{" "}
            <a href={siteConfig.telegram.href} target="_blank" rel="noopener noreferrer">
              {siteConfig.telegram.href.replace("https://", "")}
            </a>
          </p>
        ) : null}
      </section>

      <section>
        <h2>{im.purposeHeading}</h2>
        {im.purposeParagraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </section>

      {legal.governingLaw ? (
        <section>
          <h2>{im.lawHeading}</h2>
          <p>{legal.governingLaw}</p>
        </section>
      ) : null}
    </LegalShell>
  );
}
