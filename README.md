# Formware website

One-page B2B product studio site for Formware — 3D configurators, calculators and focused business software for manufacturers.

Stack: React, Vite, Three.js, GSAP.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Contact form

Set a real endpoint before launch:

```bash
# .env
VITE_CONTACT_ENDPOINT=https://your-form-endpoint.example/api
```

If the endpoint is missing, the contact block shows an email fallback from `src/siteConfig.js` (leave email empty until a real address is available — do not invent one).

## Before launch

- Confirm final brand name in `src/siteConfig.js` (currently **Formware** as working title).
- Add real contact email in `siteConfig.email`.
- Connect `VITE_CONTACT_ENDPOINT`.
- Replace privacy / imprint placeholders with real EU legal pages.
