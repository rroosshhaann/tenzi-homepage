# Tenzi Homepage

Marketing holding page for `tenzi.ai`. Single self-contained HTML file hosted on GitHub Pages.

## Site purpose

This is the **marketing root** for Tenzi. Its job is to communicate the vision and capture inbound from brokers, licensees, journalists, and investors. The contact form is the primary conversion.

The free-data publishing arm lives separately at `resources.tenzi.ai` (`rroosshhaann/tenzi-resources` repo) — that's the source of all dashboards, runbooks, and premium samples. The two sites share design tokens and a tracking endpoint but otherwise stand alone.

## File layout

```
tenzi-homepage/
  index.html              # whole site — sections, styles, tracking, form handler
  CNAME                   # tenzi.ai (GitHub Pages custom domain)
  tenzi-arcs-small.svg    # standalone Tenzi arcs (the inline SVG in index.html is the canonical copy)
  README.md               # public-facing
  CLAUDE.md               # this file
  .gitignore              # excludes Windows ADS metadata (*:Zone.Identifier) and OS cruft
```

No build step, no dependencies, no frameworks. The page runs as-is in any modern browser.

## Visual system

Extends **"Terminal Grid (Light)"** — defined in [`tenzi-resources/DESIGN_STANDARD.md`](https://github.com/rroosshhaann/tenzi-resources/blob/main/DESIGN_STANDARD.md). Cream background `#faf8f4`, white panels, single green accent `#2ca471`, Inter Tight + IBM Plex Mono.

All design tokens (`--bg`, `--accent`, `--g700` etc.) are declared inline in the `<style>` block at the top of `index.html` and match the resources project verbatim. Do not introduce new tokens.

Marketing-specific extensions to that base (this page only):

- **Hero h1** at 56px (vs 28px on resource pages) — this is a landing page, not a data document
- **Eyebrow with dot** prefix on the hero (`Tenzi · Broker Workflow Automation`)
- **`.thesis-row`** — three numbered theses pattern, unique to this page
- **`.status-grid`** — two-column status block (company snapshot + cohort state)
- **`.resources-card`** — single full-width card with a 4-column item list, mirrors but does not duplicate the resources index

The resources design standard explicitly says it does not apply to the marketing site. In practice this page follows the same tokens and component conventions; the differences above are deliberate marketing affordances, not style drift.

## Tracking

Same Google Apps Script endpoint as `resources.tenzi.ai`:

```
https://script.google.com/macros/s/AKfycbzO6crfhklS6kIOXOGNIBBSk9ZiIUdM1lESOw6hGkqfE7qxz9MbVz47_ydAitFyFQtW/exec
```

| What | Sheet | Mechanism |
|-|-|-|
| Page views | `Events` | GET beacon via `Image()`; email column = `(page view)` |
| CTA clicks | `Events` | GET beacon via `Image()`; email column = `(cta: action_name)` |
| Contact form submissions | `Contacts` | POST with `source: 'holding_page_contact'` flag |

The Apps Script branches on `data.source` to route between the two sheets and fires a notification email to `roshan@tenzi.ai` for every contact submission. See [`tenzi-resources/CLAUDE.md`](https://github.com/rroosshhaann/tenzi-resources/blob/main/CLAUDE.md) for the full Apps Script source — the script is the single source of truth, lives in the linked Google Sheet, and is shared across both sites.

### Tracked CTAs (must stay in sync with `index.html`)

| `action_name` | Where in the page | Notes |
|-|-|-|
| `resources_click` | "Open resources.tenzi.ai" button in the resources card | Outbound link |
| `email_click` | Direct email link in contact section | `mailto:` |
| `contact_submit:<interest>` | Contact form submit (auto-fired) | `<interest>` is the form's interest dropdown value |
| `footer_resources` | Footer link to resources | Outbound |
| `footer_email` | Footer email link | `mailto:` |
| `footer_linkedin` | Footer LinkedIn link | Outbound |

Every CTA button must include `onclick="trackCta('action_name')"`. The contact form calls `trackCta()` from inside `submitContact()`.

## Contact form

Form `#contactForm` collects: `name`, `email`, `organisation`, `role`, `interest`, `message`.

On submit, `submitContact(e)`:

1. POSTs the form data (plus `source: 'holding_page_contact'`, `page`, `timestamp`, cached `visitorIp`, `referrer`) to the Apps Script endpoint with `mode: 'no-cors'`.
2. Fires `trackCta('contact_submit:' + interest)`.
3. Adds the `submitted` class to the form, swapping the input view for the success view.

Server-side, the Apps Script writes a row to the **`Contacts`** sheet with columns:

```
Timestamp | Name | Email | Organisation | Role | Interest | Message | Page | IP | Referrer
```

…and sends a notification email to `roshan@tenzi.ai` with `replyTo` set to the submitter so hitting Reply in Gmail goes straight back to them.

## Hosting & deployment

- Repo: `rroosshhaann/tenzi-homepage`
- GitHub Pages source: `main` branch, root path
- Custom domain: `tenzi.ai` (CNAME file in repo root)
- HTTPS: enforced; cert auto-provisioned and renewed by GitHub via Let's Encrypt

**Push to `main` deploys automatically.** Build typically completes in 1–2 minutes.

DNS at GoDaddy (managed via `ns51/52.domaincontrol.com`):

- Apex `tenzi.ai` — four A records (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and four AAAA records (`2606:50c0:8000–8003::153`)
- `www.tenzi.ai` — CNAME to `rroosshhaann.github.io` (GitHub Pages auto-redirects to apex)
- TTL: 600s on all the above (deliberately short so DNS edits propagate fast; safe to leave there)

Do not touch any other DNS records (MX, TXT for SPF/DKIM/DMARC, the `resources` CNAME, etc.) — they belong to email and the sister project.

## Adding new sections

The page is one HTML file. To add a section:

1. Copy an existing section pattern (`.vision`, `.status-section`, `.resources-section`) inside `.wrap`.
2. Use existing component classes (`.section-label`, `.thesis`, `.status-card`, `.card`) — do not invent new ones unless the pattern genuinely doesn't exist.
3. If the section has a CTA, wire it with `onclick="trackCta('action_name')"` and add the `action_name` to the table above.
4. Keep section labels numbered (`01 / 03`, `02 / 03`, etc.) and update the totals if you add or remove sections.
5. Push to `main` — deploys on its own.

## Things to keep working

- Tracking script must remain at the bottom of `index.html` (everything depends on it).
- `trackBeacon('(page view)')` must fire on load.
- The contact form POST body must include `source: 'holding_page_contact'` — that's the routing flag for the Apps Script.
- `mode: 'no-cors'` on the form POST — without it, the cross-origin response would fail and the success view would be skipped.
- Visitor IP lookup (`api.ipify.org`) is best-effort; tracking still fires if it fails.

## Sister project

The free-data side at [`rroosshhaann/tenzi-resources`](https://github.com/rroosshhaann/tenzi-resources) defines the design system this page inherits and owns the canonical copy of the Apps Script. Changes to design tokens or the tracking schema should be made there first; this project follows.
