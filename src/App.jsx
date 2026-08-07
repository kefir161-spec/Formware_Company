import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SelectedWork from "./components/SelectedWork";
import Capabilities from "./components/Capabilities";
import Workflow from "./components/Workflow";
import Approach from "./components/Approach";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { PrivacyPage, ImprintPage } from "./components/LegalPages";
import { useI18n } from "./i18n";

function readLegalRoute(hash) {
  const value = (hash || "").replace(/^#\/?/, "").split("?")[0].toLowerCase();
  if (value === "privacy") return "privacy";
  if (value === "imprint") return "imprint";
  return null;
}

export default function App() {
  const { t } = useI18n();
  const [legalRoute, setLegalRoute] = useState(() =>
    typeof window !== "undefined" ? readLegalRoute(window.location.hash) : null,
  );

  useEffect(() => {
    const onHash = () => setLegalRoute(readLegalRoute(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (legalRoute === "privacy") return <PrivacyPage />;
  if (legalRoute === "imprint") return <ImprintPage />;

  return (
    <>
      <a className="skip-link" href="#main">
        {t.a11y.skipToContent}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <SelectedWork />
        <Capabilities />
        <Workflow />
        <Approach />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
