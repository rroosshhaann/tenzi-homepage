# Tenzi Homepage

Marketing holding page for **Tenzi** — live at `https://tenzi.ai`.

Single self-contained HTML file. No build step, no framework, no JavaScript dependencies beyond a tiny inline tracking + form-submit script.

## Page sections

```
index.html
├── Nav (Tenzi logo · "Seed funded · In stealth" badge)
├── Hero (vision tagline)
├── Why we're building this — three numbered theses
├── Where we are — Company snapshot · Design partner cohorts
├── Free for the industry — Resources card pointing at resources.tenzi.ai
├── Get in touch — Direct email · Contact form
└── Footer
```

## Hosting

GitHub Pages from `main` branch. Custom domain `tenzi.ai` (CNAME file in repo root). HTTPS enforced via a GitHub-managed Let's Encrypt cert. **Push to `main` and it deploys automatically** (1–2 min build).

DNS managed at GoDaddy:

- Apex `tenzi.ai` — four A records (`185.199.108–111.153`) plus four AAAA records (IPv6, `2606:50c0:8000–8003::153`)
- `www.tenzi.ai` — CNAME to `rroosshhaann.github.io` (auto-redirects to apex)

## Tracking

Page views, CTA clicks, and contact form submissions write to the same Google Sheet that powers `resources.tenzi.ai`:

- **`Events`** sheet — page views (`(page view)`) and CTA clicks (`(cta: action_name)`)
- **`Contacts`** sheet — full contact form payload (name, email, organisation, role, interest, message)

Contact form submissions also send a notification email to `roshan@tenzi.ai`.

The Apps Script that routes between sheets lives in the linked Google Sheet — see [`tenzi-resources/CLAUDE.md`](https://github.com/rroosshhaann/tenzi-resources/blob/main/CLAUDE.md) for the full schema and source.

## Sister project

[`rroosshhaann/tenzi-resources`](https://github.com/rroosshhaann/tenzi-resources) — free data, dashboards, and runbooks for Australian GI brokers, hosted at `resources.tenzi.ai`. Defines the **"Terminal Grid (Light)"** design system this site inherits.

## Local development

There is no build. Open `index.html` in a browser. Tracking fires to the live endpoint, so use a private/incognito window if you don't want test events polluting the sheet.

## Making changes

The page is one file with inline CSS. To add a section, copy an existing pattern (`.thesis`, `.status-card`, `.resources-item`) and place it inside `.wrap`. Keep CTA buttons wired with `onclick="trackCta('action_name')"` so behaviour is captured.

See [`CLAUDE.md`](./CLAUDE.md) for design tokens, the full CTA inventory, contact form internals, and deployment detail.

## Contact

`roshan@tenzi.ai`
