import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../i18n";
import { siteConfig } from "../siteConfig";

const FORMSUBMIT_FALLBACK = "https://formsubmit.co/ajax/kefir161@gmail.com";
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || FORMSUBMIT_FALLBACK;
const CONTACT_EMAIL = siteConfig.email || "kefir161@gmail.com";

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
      _subject: "New Formware project inquiry",
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
          <a href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL} <ArrowRight size={17} aria-hidden="true" />
          </a>
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
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
