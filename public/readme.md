# Toolskit.info

Free home & yard material calculators for US DIY projects: gravel, mulch, paint, fence, pavers and sod. A fully static, SEO-optimized multi-page website hosted on Netlify.

## What's inside

| Page | Purpose |
|---|---|
| `index.html` | Homepage: hero, all-tools grid, "how it works", editorial blocks |
| `calculators/gravel-calculator.html` | Cubic yards + tons, 3 shapes, 5 materials, waste %, cost |
| `calculators/mulch-calculator.html` | Cubic yards + bag counts (3 bag sizes), depth guidance |
| `calculators/paint-calculator.html` | Gallons from room dims, openings, coats, coverage |
| `calculators/fence-calculator.html` | Panels, posts (incl. gate posts), rails |
| `calculators/paver-calculator.html` | Paver count for 6 sizes × 3 patterns + pallets |
| `calculators/sod-calculator.html` | Pallets + rolls by lawn area, 3 pallet sizes |
| `about.html` / `contact.html` / `privacy.html` | Supporting pages (contact uses Netlify Forms) |
| `thank-you.html`, `404.html` | Form success page and custom not-found page |

## SEO features

- Unique title, meta description and canonical URL on every page
- Open Graph + Twitter card tags sitewide
- JSON-LD structured data: `WebSite`, `BreadcrumbList` on every page, plus `HowTo` and `FAQPage` on each calculator
- Long-form editorial content per calculator (formulas, coverage tables, FAQ accordions)
- `sitemap.xml`, `robots.txt`, semantic HTML, single `<h1>` per page
- `netlify.toml` with 301 pretty-URL redirects, custom 404, and immutable caching for `/assets/*`

## Tech

- Pure static HTML/CSS/JS — no build step, no framework
- Fonts: Archivo Black (display), Public Sans (body), IBM Plex Mono (numerals) via Google Fonts
- All calculations run client-side in `assets/app.js` (no data ever leaves the browser)
- Contact form handled by Netlify Forms (honeypot spam protection, AJAX submit)

## Run locally

Any static file server works, e.g.:

```bash
npx netlify-cli dev --port 8889
# or
python3 -m http.server 8000
```

Then open the shown URL. Netlify CLI additionally emulates form handling locally.

## Deploy

Push to the connected Git repository — Netlify builds automatically (`publish` directory is the repo root per `netlify.toml`). The contact form must be detected at deploy time; it is declared statically in `contact.html`.
