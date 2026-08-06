import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SelectedWork from "./components/SelectedWork";
import Capabilities from "./components/Capabilities";
import Workflow from "./components/Workflow";
import Approach from "./components/Approach";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { useI18n } from "./i18n";

export default function App() {
  const { t } = useI18n();

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
