# Tenzi Homepage

Marketing holding page for **Tenzi** — live at `https://tenzi.ai`.

Single self-contained HTML file. No build step, no framework, no JavaScript dependencies beyond `track.js` — the shared analytics tracker served from this repo at `https://tenzi.ai/track.js` and loaded by both this site and `resources.tenzi.ai`.

## Page sections

```
index.html
├── Nav (Tenzi logo · "Seed funded · In stealth" badge)
├── Hero (outcome pitch — "More clients. Less admin.")
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

`track.js` in this repo is the shared client-side tracker for both `tenzi.ai` and `resources.tenzi.ai`. It fires page views, CTA clicks, dwell time, and contact-form POSTs to the same Google Sheet.

- **`Events`** sheet — page views (`(page view)`), CTA clicks (`(cta: action_name)`), dwell time (`(dwell: N)`). Column F tags the origin site (`marketing` / `resources`).
- **`Contacts`** sheet — full contact form payload (name, email, organisation, role, interest, message).

Contact form submissions also send a notification email to `roshan@tenzi.ai`.

The Apps Script that routes between sheets lives in the linked Google Sheet — see [`tenzi-resources/apps-script.gs`](https://github.com/rroosshhaann/tenzi-resources/blob/main/apps-script.gs) for the source of truth, and [`tenzi-resources/CLAUDE.md`](https://github.com/rroosshhaann/tenzi-resources/blob/main/CLAUDE.md) for schema notes.

A private analytics dashboard on top of these events is built into the same web app — see [`tenzi-resources/DASHBOARD.md`](https://github.com/rroosshhaann/tenzi-resources/blob/main/DASHBOARD.md) for the full reference.

## Sister project

[`rroosshhaann/tenzi-resources`](https://github.com/rroosshhaann/tenzi-resources) — free data, dashboards, and runbooks for Australian GI brokers, hosted at `resources.tenzi.ai`. Defines the **"Terminal Grid (Light)"** design system this site inherits.

## Local development

There is no build. Open `index.html` in a browser. Tracking fires to the live endpoint (including loading `https://tenzi.ai/track.js` cross-origin), so use a private/incognito window if you don't want test events polluting the sheet. If you're editing `track.js` locally, temporarily change the `<script src>` in `index.html` to `track.js` (root-relative) to load the local copy.

## Making changes

The page is one file with inline CSS. To add a section, copy an existing pattern (`.thesis`, `.status-card`, `.resources-item`) and place it inside `.wrap`. Keep CTA buttons wired with `onclick="trackCta('action_name')"` — the global alias from `track.js` captures it.

See [`CLAUDE.md`](./CLAUDE.md) for design tokens, the full CTA inventory, contact form internals, and deployment detail.

## Contact

`roshan@tenzi.ai`
