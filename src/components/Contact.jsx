import React, { useState } from "react";
import { ArrowRight, Send } from "lucide-react";
import { useI18n } from "../i18n";
import { siteConfig } from "../siteConfig";

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "";

export default function Contact() {
  const { t } = useI18n();
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const hasEndpoint = Boolean(ENDPOINT);
  const hasEmail = Boolean(siteConfig.email);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!hasEndpoint) return;

    const form = event.currentTarget;
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      source: siteConfig.name,
    };

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(t.contact.error);
      console.error(err);
    }
  };

  return (
    <section className="contact section-dark" id="contact">
      <div className="contact-layout">
        <div className="contact-copy">
          <p className="section-kicker mono">{t.contact.kicker}</p>
          <h2>{t.contact.title}</h2>
          <p>{t.contact.lead}</p>
          {hasEmail ? (
            <a href={`mailto:${siteConfig.email}`}>
              {siteConfig.email} <ArrowRight size={17} aria-hidden="true" />
            </a>
          ) : null}
        </div>

        <div className="contact-form-wrap">
          {status === "success" ? (
            <div className="form-success" role="status">
              <h3>{t.contact.success.title}</h3>
              <p>{t.contact.success.text}</p>
              <button type="button" onClick={() => setStatus("idle")}>
                {t.contact.success.again}
              </button>
            </div>
          ) : hasEndpoint ? (
            <form className="contact-form" onSubmit={onSubmit} noValidate={false}>
              <label>
                <span>{t.contact.form.name}</span>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder={t.contact.form.namePlaceholder}
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
                />
              </label>
              <label className="full">
                <span>{t.contact.form.message}</span>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder={t.contact.form.messagePlaceholder}
                />
              </label>
              <button
                className="button button-accent"
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? t.contact.form.sending : t.contact.form.submit}
                <Send size={17} aria-hidden="true" />
              </button>
              <small>{t.contact.form.consent}</small>
              {status === "error" ? (
                <p className="form-error" role="alert">
                  {errorMsg}
                  {hasEmail ? (
                    <>
                      {" "}
                      <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                    </>
                  ) : null}
                </p>
              ) : null}
            </form>
          ) : (
            <div className="form-fallback" role="status">
              <h3>{t.contact.fallback.title}</h3>
              <p>{t.contact.fallback.text}</p>
              {hasEmail ? (
                <a className="button button-accent" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email} <ArrowRight size={17} aria-hidden="true" />
                </a>
              ) : (
                <p className="form-fallback-note">{t.contact.fallback.noEmail}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
