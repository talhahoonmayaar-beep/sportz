# AGENTS.md — buildingmaterialcalculator.netlify.app

## Project overview

Fully static multi-page website providing free home & yard material calculators for US DIY audiences. No framework, no build step: the repo root is the publish directory (see `netlify.toml`). Everything is hand-written HTML/CSS/JS optimized for speed and SEO.

## Directory layout

```
/
├── index.html              # Homepage (hero + tool grid + editorial sections)
├── about.html              # About page
├── contact.html            # Contact page — Netlify Form ("contact")
├── privacy.html            # Privacy policy
├── thank-you.html          # Form success redirect target (noindex)
├── 404.html                # Custom not-found page (noindex)
├── styles.css              # Entire design system ("contractor's field manual" aesthetic)
├── assets/app.js           # All calculator logic + nav/form bootstrapping
├── calculators/            # Six calculator pages, one h1 each
├── sitemap.xml             # All indexable pages
├── robots.txt              # Allows all except /thank-you.html
└── netlify.toml            # Redirects, headers, dev settings
```

## Architecture notes

- **Calculators**: each page has `<section class="calc" data-calc="<kind>">` with an inputs grid and `.calc-out` result container. `assets/app.js` maps `data-calc` to a pure function in the `CALCS` registry that returns an HTML string (result or inline error). Button click runs it; further inputs re-run live once the first calculation happened.
- **Densities and coverage constants** (gravel tons/yd³, paver sizes, pallet sizes, paint coverage) live in the calculator functions in `app.js`. Update both the function and the page's editorial tables together.
- **Design system**: CSS custom properties at the top of `styles.css` (paper/ink-green/amber palette; Archivo Black + Public Sans + IBM Plex Mono). No utility framework — semantic class names.
- **Header/footer are duplicated** in every HTML file (no templating). When editing navigation or footer links, update all 10 HTML files. Footer paths differ: root pages use `calculators/…`, calculator pages use `../`.

## Conventions

- SEO: every page has unique `<title>`, meta description, canonical URL, Open Graph tags, and a `BreadcrumbList` JSON-LD. Calculator pages additionally carry `HowTo` and `FAQPage` JSON-LD. Keep schema JSON and the visible FAQ text in sync.
- Single `<h1>` per page. FAQ accordions are `<details class="faq">`.
- No comments in code. No build tooling — do not introduce bundlers.
- All interactive elements must remain functional with JS disabled where possible (details/summary FAQ works natively; forms degrade to normal POST).

## Non-obvious decisions

- **Static over framework**: the product is content + small calculators; static pages rank better, deploy faster, and need zero maintenance. Templates were rejected for this reason.
- **Netlify Forms** handles contact with a static form in `contact.html` (detectable at deploy time) plus honeypot `bot-field` and AJAX submission to `/` with a redirect to `/thank-you.html`. The Forms feature is enabled for the site via the skill's enable script.
- **Client-side only calculations**: measurements never leave the browser — this is a stated privacy guarantee in `privacy.html`. Do not add telemetry to calculators.
- **.html URLs kept canonical** (with 301 shortcuts like `/calculators/gravel`) rather than extensionless, because the publish root is the repo root and Netlify's default pretty-URL behavior covers the rest.
- **`robots.txt` disallows `/thank-you.html`** and both thank-you and 404 pages are `noindex` to keep search indexes clean.

## When adding a new calculator

1. Create `calculators/<slug>-calculator.html` modeled on an existing page (hero, `.calc` section with `data-calc`, prose article, FAQ `<details>` list).
2. Add a `CALCS.<kind>` function in `assets/app.js` returning `ok(...)` or `err(...)`.
3. Add the card to `index.html` grid + quick panel, footer links in **all** HTML files, sitemap entry, and `HowTo`/`FAQPage` schema.
