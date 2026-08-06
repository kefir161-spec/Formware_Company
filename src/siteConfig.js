/**
 * Single source for brand identity and primary links.
 * Replace name / email / legal placeholders when final brand details are ready.
 */
export const siteConfig = {
  name: "Formware",
  tagline: "3D Configurators & Digital Sales Tools for Manufacturers",
  url: "https://kefir161-spec.github.io/Formware_Company/",
  email: "kefir161@gmail.com",
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
    privacyHref: "",
    imprintHref: "",
    /** Explicit placeholders — not live legal pages */
    privacyLabel: "Privacy (to be connected)",
    imprintLabel: "Imprint (to be connected)",
  },
  workLinks: {
    aluminum: "https://kefir161-spec.github.io/aluminum-mudguard/",
    flooring: "https://kefir161-spec.github.io/modular-floor-calculator/",
    cubik: "https://qubik.one/builder/",
  },
};
