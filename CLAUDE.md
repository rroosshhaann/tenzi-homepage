# Tenzi Homepage

Marketing holding page for `tenzi.ai`. Single self-contained HTML file hosted on GitHub Pages.

## Site purpose

This is the **marketing root** for Tenzi. Its job is to communicate the vision and capture inbound from brokers, licensees, journalists, and investors. The contact form is the primary conversion.

The free-data publishing arm lives separately at `resources.tenzi.ai` (`rroosshhaann/tenzi-resources` repo) — that's the source of all dashboards, runbooks, and premium samples. The two sites share design tokens and a tracking endpoint but otherwise stand alone.

## File layout

```
tenzi-homepage/
  index.html              # whole site — sections, styles, tracking, form handler
  track.js                # shared analytics tracker (see Tracking below; served at https://tenzi.ai/track.js)
  og.png                  # 2400×1260 social share card (og:image, 2× for crisp LinkedIn downscale) — regenerate if the hero changes; bump the ?v= cache-buster on the og:image URL when replacing
  robots.txt              # deliberately permissive, AI crawlers included; points at sitemap.xml
  sitemap.xml             # single URL
  llms.txt                # site summary for AI assistants
  CNAME                   # tenzi.ai (GitHub Pages custom domain)
  tenzi-arcs-small.svg    # standalone Tenzi arcs; also the favicon
  tenzi-blue.svg          # nav logo (arcs + wordmark); also used in og.png
  README.md               # public-facing
  CLAUDE.md               # this file
  .gitignore              # excludes Windows ADS metadata (*:Zone.Identifier) and OS cruft
```

No build step, no dependencies, no frameworks. The page runs as-is in any modern browser.

## Visual system

Extends **"Terminal Grid (Light)"** — defined in `../tenzi-resources/DESIGN_STANDARD.md` (sibling checkout). Cream background `#faf8f4`, white panels, single green accent `#2ca471`, Inter Tight + IBM Plex Mono.

All design tokens (`--bg`, `--accent`, `--g700` etc.) are declared inline in the `<style>` block at the top of `index.html` and match the resources project verbatim. Do not introduce new tokens.

Marketing-specific extensions to that base (this page only):

- **Hero h1** at 56px (vs 28px on resource pages) — this is a landing page, not a data document
- **Eyebrow with dot** prefix on the hero (`For Australian insurance brokers · GI`)
- **`.hero-cta`** — primary "Register interest for Cohort 02" button (`.btn-primary`, shares its ruleset with `.btn-resources`) plus a quiet mailto link. Anchors to `#contact` and pre-selects the interest dropdown to `cohort` via `goCohort()` (defined next to `submitContact()`)
- **`.thesis-row`** — three-card grid, used by "What this looks like" (the product workflow cards)
- **`.thesis-list` / `.thesis-item`** — open editorial rows (large mono numeral, dashed separators, no panels), used by "Why we're building this" so the argument reads differently from the product cards directly above it
- **`.status-grid`** — two-column status block (company snapshot + cohort state). The snapshot includes the patent-pending row; the cohort card holds the concrete Cohort 02 offer and a commented-out `.partner-quote` stub awaiting the first real Cohort 01 quote (styles already shipped)
- **`.resources-card`** — single full-width card with a 4-column item list, mirrors but does not duplicate the resources index
- **`.faq-grid`** — "Common questions": six `.status-card` Q&As, mirrored by a `FAQPage` JSON-LD block in the head. The schema answer text must stay in sync with the visible answers

**Copy conventions (apply to visible page text, not these docs):**

- **Outcome-led hero.** H1 is `More clients. Less admin.` (trade-off framing, green accent on "Less admin."). Subhead opens broker-perspective (`We take the slow, manual parts of new business, renewals, and claims off your desk, so the same broker, in the same hours, can write more and serve clients better.`). Avoid tech-led openers like "AI that…", "Software for…", or "Operating platform for…" in this section. The eyebrow (`For Australian insurance brokers · GI`) carries the audience targeting; the H1 carries the hook; the subhead describes what the software does.
- **No em-dashes in body copy.** The visible page intentionally avoids `—`. Substitute contextually: comma for connectors, colon for list/summary introducers, parentheses for parentheticals, period to break into two sentences. The `<meta description>` is the one exception — it keeps one em-dash and the `Intelligent workflow automation software for Australian insurance brokers.` opener (different audience: search snippets and link previews benefit from the category descriptor).

The resources design standard explicitly says it does not apply to the marketing site. In practice this page follows the same tokens and component conventions; the differences above (visual + copy) are deliberate marketing affordances, not style drift. Note that `tenzi-resources/DESIGN_STANDARD.md` says em-dash is the preferred connector — that rule applies to resources pages, not here.

## Head & share metadata

- `<title>` is `Tenzi · More clients. Less admin.` — the title doubles as the analytics `page` key (`track.js` sends `document.title`), and the pre-redesign page was titled `More clients. Less admin.`, so the dashboard's per-page dwell table compares the two versions by these two rows. Don't casually change the title: it forks the analytics page key.
- OG/Twitter tags point at `og.png`. LinkedIn caches previews — re-scrape via LinkedIn Post Inspector after changing the card.
- JSON-LD blocks in the head: `Organization` (legalName Tenzi Pty Ltd, founder) and `FAQPage` (must mirror the visible FAQ answers).
- **Cohort facts live in three places** — the cohort status card, the FAQ (visible + schema), and `llms.txt`. When Cohort 02's date/spots/status change, update all three together.

## Tracking

All client-side tracking is handled by **`track.js`** (checked into this repo, served at `https://tenzi.ai/track.js`). The same file is loaded by `resources.tenzi.ai` and `partner.tenzi.ai`, so this is the **single source of truth** for every analytics beacon the three sites emit.

Loaded at the bottom of `index.html`:

```html
<script src="https://tenzi.ai/track.js"></script>
<script>tenziTrack.init({ site: 'marketing' });</script>
```

`init` fires `(page view)` and starts a visibility-aware dwell timer that emits `(dwell: N)` on `pagehide`. The page-view beacon also re-fires on BFCache restore (browser back/forward) via a `pageshow` listener — without it, return visits via the back button silently dropped because the browser replays the page without re-running `init()`. Each BFCache restore also resets the dwell counters so the restored session emits its own `(dwell: N)` when the visitor leaves again. The site tag (`marketing` / `resources` / `partner`) goes into column F of the Events sheet so Looker Studio can filter by site. `init` also accepts an optional `user` — a known-visitor id (the partner site passes the authenticated broker id from its auth cookie); when set, it travels as `recipient` on every beacon and lands in column G, the same column newsletter recipient identity uses. When no explicit `user` is given, `init` falls back to the newsletter hand-off: the `resources.tenzi.ai/r/` click redirect appends `?tzr=<recipient>` to tenzi.ai destinations, and `track.js` lifts that id out of the URL on load (stripped immediately via `history.replaceState` so it never lingers in the address bar or copied links), stores it in `sessionStorage` (`tenzi_tzr`), and sends it as `recipient` on every beacon for the rest of the tab session — so report page views, dwell, and CTA clicks from newsletter visitors stay attributed to the person.

### What lands where

| What | Sheet | Mechanism |
|-|-|-|
| Page views | `Events` | `tenziTrack.init()` (and `pageshow` for BFCache) → `fetch(keepalive)` GET with `Image()` fallback; email column = `(page view)` |
| CTA clicks | `Events` | `tenziTrack.trackCta(action)` → `fetch(keepalive)` GET with `Image()` fallback; email column = `(cta: action_name)` |
| Dwell time (seconds visible) | `Events` | `pagehide` → `fetch(keepalive)` GET with `Image()` fallback; email column = `(dwell: N)` |
| Contact form submissions | `Contacts` | `tenziTrack.postForm({ source: 'holding_page_contact', ... })` |

The Apps Script branches on `data.source` (`holding_page_contact` → `Contacts` sheet + notify email; everything else → `Events`) and fires a notification email to `roshan@tenzi.ai` for every contact submission. See `../tenzi-resources/apps-script.gs` (sibling checkout) for the source of truth — the deployed script lives in the linked Google Sheet. Edits must be mirrored there manually via Deploy > Manage deployments > New version.

The same Apps Script web app exposes a private analytics dashboard built on top of these events. Reference: [`../tenzi-resources/DASHBOARD.md`](https://github.com/rroosshhaann/tenzi-resources/blob/main/DASHBOARD.md).

### `tenziTrack` API (from `track.js`)

| Call | Purpose |
|-|-|
| `tenziTrack.init({ site, user })` | Fire page view, start dwell timer, cache visitor IP; optional `user` = known-visitor id sent as `recipient` (Events column G) on every beacon. Falls back to the `?tzr=` newsletter hand-off param / `sessionStorage` when omitted |
| `tenziTrack.trackCta(action)` | Fire `(cta: action)` beacon |
| `tenziTrack.trackBeacon(event)` | Fire arbitrary-named beacon |
| `tenziTrack.postForm(data)` | POST JSON to endpoint; auto-adds `page`, `timestamp`, `referrer`, `site`, `ip` |
| `tenziTrack.getVisitorIp()` | Cached IP (best-effort, may be empty) |

Legacy globals `window.trackCta` and `window.trackBeacon` are also defined so existing inline `onclick="trackCta('...')"` attributes keep working.

### Tracked CTAs (must stay in sync with `index.html`)

| `action_name` | Where in the page | Notes |
|-|-|-|
| `hero_cohort` | Hero "Register interest for Cohort 02" button | Anchors to `#contact`, pre-selects interest=cohort via `goCohort()` |
| `hero_email` | Hero "or email roshan@tenzi.ai" link | `mailto:` |
| `cohort_card_contact` | "register interest below" link in the cohort status card | Anchor + pre-select via `goCohort()` |
| `resources_click` | "Open resources.tenzi.ai" button in the resources card | Outbound link |
| `faq_cohort` | "register interest for Cohort 02" link in the FAQ | Anchor + pre-select via `goCohort()` |
| `email_click` | Direct email link in contact section | `mailto:` |
| `contact_submit:<interest>` | Contact form submit (auto-fired) | `<interest>` is the form's interest dropdown value |
| `footer_resources` | Footer link to resources | Outbound |
| `footer_email` | Footer email link | `mailto:` |
| `footer_linkedin` | Footer LinkedIn link | Outbound |

Every CTA button must include `onclick="trackCta('action_name')"`. The contact form calls `trackCta()` from inside `submitContact()`.

## Contact form

Form `#contactForm` collects: `name`, `email`, `organisation`, `role`, `interest`, `message`. There is also a hidden **honeypot** input `website` (off-screen `aria-hidden` div) — real users never see it; bots that auto-fill all visible inputs will populate it.

On submit, `submitContact(e)`:

1. Calls `tenziTrack.postForm({ source: 'holding_page_contact', ...fields })`. The shared tracker auto-adds `page`, `timestamp`, `referrer`, `site: 'marketing'`, and cached `ip`, then POSTs to the Apps Script endpoint with `mode: 'no-cors'`.
2. Fires `tenziTrack.trackCta('contact_submit:' + interest)`.
3. Adds the `submitted` class to the form, swapping the input view for the success view.

Server-side, the Apps Script:

1. Drops the request silently if `data.website` is non-empty (honeypot caught a bot).
2. Drops silently if the IP has already submitted ≥5 contacts in the last hour (rate limit, `PropertiesService`-backed).
3. Otherwise writes a row to the **`Contacts`** sheet with columns:

   ```
   Timestamp | Name | Email | Organisation | Role | Interest | Message | Page | IP | Referrer
   ```

4. Sends a notification email to `roshan@tenzi.ai` (wrapped in try/catch — quota exhaustion no longer breaks the row save) with `replyTo` set to the submitter so hitting Reply in Gmail goes straight back to them.

The honeypot field MUST stay positioned off-screen (`position:absolute; left:-10000px; ...`) — `display:none` is the first thing modern bots skip. Do not move it inside `.field-row` or give it a visible class.

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

1. Copy an existing section pattern (`.vision`, `.status-section`, `.resources-section`, `.faq-section`) inside `.wrap`.
2. Use existing component classes (`.section-label`, `.thesis`, `.thesis-item`, `.status-card`, `.card`) — do not invent new ones unless the pattern genuinely doesn't exist.
3. If the section has a CTA, wire it with `onclick="trackCta('action_name')"` and add the `action_name` to the table above.
4. Keep section labels numbered (`01 / 05`, `02 / 05`, etc.) and update the totals if you add or remove sections.
5. Push to `main` — deploys on its own.

## Things to keep working

- `<script src="https://tenzi.ai/track.js">` + `tenziTrack.init({ site: 'marketing' })` must remain at the bottom of `index.html` (everything depends on it).
- `track.js` itself must continue to be served at the repo root so `https://tenzi.ai/track.js` resolves. Do not move it into a subfolder — resources.tenzi.ai and partner.tenzi.ai load it cross-origin via that exact URL.
- The contact form POST must include `source: 'holding_page_contact'` — that's the routing flag for the Apps Script.
- `mode: 'no-cors'` on the form POST (handled inside `tenziTrack.postForm`) — without it, the cross-origin response would fail and the success view would be skipped.
- Visitor IP lookup (`api.ipify.org`) is best-effort; tracking still fires if it fails.
- `og.png`, `robots.txt`, `sitemap.xml`, and `llms.txt` are referenced by absolute `https://tenzi.ai/...` URLs (og:image tag, robots' Sitemap line) — keep them at the repo root.
- The patent row says "Patent pending. Provisional application filed covering form-filling automation." A provisional lapses 12 months after filing — pull or update the row if it isn't converted to a complete application.

## Sister project

The free-data side at `../tenzi-resources/` (repo: `rroosshhaann/tenzi-resources`) defines the design system this page inherits and owns the canonical copy of the Apps Script. Changes to design tokens or the tracking schema should be made there first; this project follows.
