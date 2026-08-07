/**
 * Single source for brand identity and primary links.
 */
export const siteConfig = {
  name: "ALT BUREAU",
  tagline: "3D Configurators & Digital Sales Tools for Manufacturers",
  url: "https://kefir161-spec.github.io/Formware_Company/",
  telegram: {
    href: "https://t.me/Kefir161",
  },
  region: "Europe · 2026",
  social: {
    // Add real profiles when available
  },
  nav: [
    { id: "work", href: "#work", labelKey: "work" },
    { id: "capabilities", href: "#capabilities", labelKey: "capabilities" },
    { id: "approach", href: "#approach", labelKey: "approach" },
    { id: "contact", href: "#contact", labelKey: "contact" },
  ],
  cta: { href: "#contact", labelKey: "discussProject" },
  legal: {
    privacyHref: "#privacy",
    imprintHref: "#imprint",
    privacyLabel: "Privacy",
    imprintLabel: "Imprint",
    /** Operator shown on Imprint — fill address / VAT / register when available */
    operator: "ALT BUREAU",
    responsible: "",
    addressLines: [],
    // Example when ready: ["Street 1", "City, Country"]
    vatId: "",
    companyRegister: "",
    governingLaw: "European Union / applicable local law",
  },
  workLinks: {
    aluminum: "https://kefir161-spec.github.io/aluminum-mudguard/",
    flooring: "https://kefir161-spec.github.io/modular-floor-calculator/",
    cubik: "https://qubik.one/builder/",
    stroyzhurnal: "https://github.com/kefir161-spec/construction-work-log",
    cubikCore: "https://github.com/kefir161-spec/cubik-core-public",
  },
};
