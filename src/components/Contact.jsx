import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../i18n";
import { siteConfig } from "../siteConfig";

const FORMSUBMIT_FALLBACK = "https://formsubmit.co/ajax/kefir161@gmail.com";
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || FORMSUBMIT_FALLBACK;
const TELEGRAM_HREF = siteConfig.telegram?.href;

function TelegramIcon() {
  return (
    <svg
      className="contact-channel-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M21.8 4.3c.3-.1.6 0 .7.3.1.2.1.5 0 .7L18.2 20c-.1.3-.4.5-.7.5-.2 0-.3 0-.5-.1l-5.3-3.4-2.7 2.6c-.2.2-.5.2-.7.1-.2-.1-.3-.4-.3-.6v-4.1L18.5 7.4c.2-.2 0-.3-.2-.2l-10.7 6.6-4-1.3c-.3-.1-.5-.4-.4-.7.1-.3.3-.5.6-.5l18-7z"
      />
    </svg>
  );
}

export default function Contact() {
  const { t } = useI18n();
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === "loading") return;

    const form = event.currentTarget;
    const honeypot = form.elements.namedItem("_honey");
    if (honeypot && String(honeypot.value || "").trim()) {
      setStatus("success");
      form.reset();
      return;
    }

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const company = form.company.value.trim();
    const message = form.message.value.trim();

    const payload = {
      name,
      email,
      company,
      message,
      _subject: "New ALT BUREAU project inquiry",
      _template: "table",
      _replyto: email,
      _url: siteConfig.url,
      _honey: "",
    };

    setStatus("loading");

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("submit_failed");
      const data = await res.json().catch(() => ({}));
      if (data.success === false || data.success === "false") {
        throw new Error("submit_failed");
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="contact section-dark" id="contact">
      <div className="contact-layout">
        <div className="contact-copy">
          <p className="section-kicker mono">{t.contact.kicker}</p>
          <h2>{t.contact.title}</h2>
          <p>{t.contact.lead}</p>

          {TELEGRAM_HREF ? (
            <ul className="contact-channels">
              <li>
                <a
                  className="contact-channel"
                  href={TELEGRAM_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="contact-channel-meta">
                    <span className="mono contact-channel-label">
                      {t.contact.channels.telegram}
                    </span>
                    <span className="contact-channel-value contact-channel-value--tg">
                      <TelegramIcon />
                      {t.contact.channels.telegramAction}
                    </span>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              </li>
            </ul>
          ) : null}
        </div>

        <div className="contact-form-wrap">
          {status === "success" ? (
            <div className="form-success" role="status">
              <span className="form-success-dot" aria-hidden="true" />
              <p className="form-success-title">{t.contact.success.title}</p>
              <button type="button" onClick={() => setStatus("idle")}>
                {t.contact.success.again}
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit} noValidate={false}>
              <label className="visually-hidden" aria-hidden="true">
                <span>Do not fill</span>
                <input
                  type="text"
                  name="_honey"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
              <label>
                <span>{t.contact.form.name}</span>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder={t.contact.form.namePlaceholder}
                  disabled={status === "loading"}
                />
              </label>
              <label>
                <span>{t.contact.form.email}</span>
                <input
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder={t.contact.form.emailPlaceholder}
                  disabled={status === "loading"}
                />
              </label>
              <label className="full">
                <span>{t.contact.form.company}</span>
                <input
                  name="company"
                  autoComplete="organization"
                  placeholder={t.contact.form.companyPlaceholder}
                  disabled={status === "loading"}
                />
              </label>
              <label className="full">
                <span>{t.contact.form.message}</span>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder={t.contact.form.messagePlaceholder}
                  disabled={status === "loading"}
                />
              </label>
              <button
                className="button button-accent"
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? t.contact.form.sending : t.contact.form.submit}
              </button>
              <small>{t.contact.form.consent}</small>
              {status === "error" ? (
                <p className="form-error" role="alert">
                  {t.contact.error}{" "}
                  {TELEGRAM_HREF ? (
                    <a
                      href={TELEGRAM_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.contact.channels.telegram}
                    </a>
                  ) : null}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
