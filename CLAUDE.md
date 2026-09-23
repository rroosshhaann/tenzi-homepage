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
  og-frame.html           # source frame for og.png — see "Regenerating og.png" below
  about-insurance-news-top20-2026.jpg   # Insurance News interview page (754×913) shown in the "Why I'm building this" panel; same file as on resources.tenzi.ai/about.html
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

Extends **"Terminal Grid (Light)"** — defined in `../tenzi-resources/DESIGN_STANDARD.md` (sibling checkout). Cream background `#faf8f4`, white panels, Inter Tight + IBM Plex Mono. Greens come from the teal ramp: `--g900` headings, `--g700` for green text, links, button fills and marks, `--g500` for tints and glows. The jade `--accent` (`#2ca471`) and `--accent-hover` stay declared so the token block still matches the resources project verbatim, but this page no longer uses them: as text they measured about 3:1 (AA needs 4.5:1), and on 2026-09-23 Roshan chose one green family over jade marks beside teal text.

All design tokens (`--bg`, `--accent`, `--g700` etc.) are declared inline in the `<style>` block at the top of `index.html` and match the resources project verbatim. Do not introduce new tokens.

Marketing-specific extensions to that base (this page only):

- **Hero h1** at 56px (vs 28px on resource pages) — this is a landing page, not a data document
- **Eyebrow** on the hero (`For Australian insurance brokers (GI)`), no dot
- **`.hero-cta`** — primary "Try it on your next renewal batch" button (`.btn-primary`: 14px Inter Tight in sentence case, white on `--g700`, `--g900` on hover, at least 44px tall) anchoring to `#cohort`, plus a quiet mailto link. A solid button always means Cohort 02: `.btn-resources` shares the base ruleset but is restyled as an outline button, because it leaves the site
- **`.hero-figure`** (2026-09-18, after an investor asked for an image that reinforces the capacity the design partners are indicating, looking towards clients rather than back at admin) — the hero is a two-column grid, `.hero-copy` beside the figure, stacked under 980px. The figure is an inline SVG (`.capacity`): two lanes labelled `Today` and `With Tenzi`, each a 4×5 grid of faint rings (`.slot`) with a tick disc (`.t`) per slot: Tenzi discs `--g500` at 22% with `--g700` ticks, Today discs grey. The script at the bottom of `index.html` switches discs on (`.t.on`) at each lane's pace, Today one every 400 ms and Tenzi one every 240 ms, so when the Tenzi lane fills its twenty the Today lane has twelve (three rows to five). It plays once each time the figure comes into view (30% visible), about 4.8 s, and holds the end state; it clears only once the figure is fully off screen, so it plays again on the way back. Until 2026-09-23 it looped endlessly, which fails WCAG 2.2.2 (motion over 5 s beside other content with no way to stop it); Roshan chose replay-on-return. It paints the end state under `prefers-reduced-motion`; without JS the `<noscript>` rule in the head shows the `.t.end` discs (12 Today, 20 Tenzi; keep them in step with the pace). It sits straight on the cream with no panel and is deliberately not in the shared-backdrop rule. Caption (Roshan's line): `More time for clients, more time to grow.` Roshan chose ticks over tiles and person icons because a tick reads as done without a caption. **The three-to-five pace is illustrative, not a measured figure**: he set it knowingly on 2026-09-18; replace it with the measured figure once a Cohort 01 month-three Measure session produces one, and don't put numbers on the figure before then
- **`#cohort` section** (`.status-grid` + `.thesis-row`) — the Cohort 02 ask: a `.contact-copy` panel (the offer, the counts, a "this suits you if" `.status-list`, the walk-away line, "Put your hand up" button to `#contact`), a `.status-card` "The terms, plainly" list (seats, length, time, cost, where it runs, licensee), then one wide `.status-card.steps` holding a three-column `.resources-list` strip for Map / Use / Measure (a strip on purpose, not a card row, so it doesn't mirror the three-card "What it does" row directly below; Roshan flagged the repetition 2026-09-07)
- **`.thesis-row`** — "What it does", renewals first. Since 2026-09-18 the renewals card is `.thesis.featured`: full width, its copy in `.thesis-body` beside `.batch`, an `Example batch, this month` list of eight pre-renewals (`.batch-list`; each row a client written as type and suburb, never a name, with a status of Sent, Your sign-off, or Drafting, and a fade at the foot so the batch reads as longer; caption `Drafted by Tenzi. Checked by you. Sent from your own Outlook.`); new business and claims share the two-column row below. Each card carries one status in `.thesis-tag`: Running with partners / Next / In design with partners; `.thesis-tag.now` is the `--g700` live one (the category tags that repeated each heading were cut 2026-09-23). The batch rows arrive one by one the first time the batch scrolls into view, the only entry motion on the page (at rest without JS or under reduced motion); on phones each row puts the cover type on its own line. `.fig-head`, `.fig-tag` (an 11px mono label) and `.fig-cap` (a 13px Inter Tight sentence, not caps) are shared by the batch and the hero figure
- **Founder note** — a tinted `.contact-copy.note` panel in first person laid out as a grid: `.note-body` (h2 "I came to this as a buyer.", the buyer-first origin paragraph, the "hard part was never the technology" lesson, signature with email + personal LinkedIn) beside `.note-photo`, a `<figure>` holding the full Insurance News interview page (`about-insurance-news-top20-2026.jpg`, 754×913, the same file the resources about page uses) with a 13px sentence-case caption, and under both a full-width `.resources-list` strip of four tagged facts (50+ conversations this year · a decade in AI, in the words Roshan published in that interview · four broker teams in Cohort 01 · the Insurance News interview, linked). Roshan chose the whole page over a cropped headshot because it reads as a publication interview, and the origin deliberately says "curious about the other side of the process", never "bad experience", so it can't read as a review of a broker. The page and the "Read it" link go to `resources.tenzi.ai/about.html`. Stacks on phones with the page under the text
- **`.resources-card`** — single full-width card with a 4-column item list, mirrors but does not duplicate the resources index. Deliberately quieter than the ask: a 22px heading and an outline button
- **`.faq-grid`** — "Common questions": six Q&As as a ruled two-column list (`.faq-grid .status-card` strips the panel, border and glow, so the boxed cards stay for the ask, the product, the founder and the form), each a 17px g900 question with no tag above it, mirrored by a `FAQPage` JSON-LD block in the head. The schema answer text must stay in sync with the visible answers. The section label's left text is an `<h2>`, so the questions don't nest under the resources heading
- Section labels carry a short status on the right (`.section-num`) only when it adds information ("Now open, six seats", the founder's name); the ones that repeated nearby text were cut 2026-09-23. No numerals, no "01 / 05" counters, and no decorative mono tags on cards
- **Green layering rule** (Roshan, 2026-09-07, modelled on the resources card; revised 2026-09-23 after an Impeccable audit measured the jade text at about 3:1): headings in `--g900`; green text, links, small mono labels (hero eyebrow, section status, `.thesis-tag.now`, `.status-list .k`, `.contact-direct .label`, batch states) and button fills in `--g700` (5.2 to 5.5:1); marks (hero ticks, batch glyphs, the focused field's border and ring) in `--g700` with `--g500` tints. Never `--accent` for text on this page. Form field labels are plain 13px Inter Tight in `--text`. Small mono labels share one spec, 11px with 0.08em tracking in caps (Impeccable's 11px floor), and sentences are never set in caps. Plus **one shared backdrop seen only through the cards**: the backdrop rule, declared after the panels so it wins, gives every panel (`.thesis`, `.status-card`, `.resources-card`, `.contact-copy`, `.contact-form`) the same page-sized gradient (seven glows walking down the page, alternating side and shade across g700 / g500 and a third fainter since 2026-09-23, tight bright ones and broad soft ones, over a faint 160° wash from g50 at the top to g100 at the foot; positions and sizes in % of the page so they scale with page length, placed roughly at cohort, steps, what-it-does, founder, resources, FAQ, form), and a small script at the bottom of `index.html` sets each panel's `background-size` to the `.wrap` dimensions and `background-position` to the negative of the panel's layout offset, re-run on load, resize, and any `.wrap` size change. Cards in a row therefore show one continuous band, the cream ground and gutters stay plain (Roshan wanted the effect on cards only, 2026-09-07), and without the script each card falls back to the glows at card size. On phones (700px and under) the panels show the wash alone, because %-sized glows stretch into streaks on a tall, narrow page. The script uses layout offsets, not `getBoundingClientRect`, so a transform can't skew it. Don't give individual cards their own `background-image`; to change the glow, edit the shared rule (the FAQ list and the phone wash are the two deliberate overrides). Status tags on cards stay muted unless live (`.thesis-tag.now`). Section-label left text and body copy stay muted. The hero figure is not a panel and is not in the backdrop rule; it sits on the cream
- **Calm chrome** (2026-09-23 tweak pass, after an Impeccable critique found the frame reading as a generated landing page while the content read as Tenzi's own): no fade-ups on load (they finished before anyone scrolled to them), so the batch rows are the only entry motion; static cards have no hover state; the nav badge is plain text with no pill or dot, and the eyebrow has no dot; middle dots only in true lists (the signature, the runbooks title, the footer, and the `<title>`). The nav logo is 36.8px tall (15% up from 32px, Roshan 2026-09-23). Phones get one panel padding (22px 20px), 16px form fields so iOS doesn't zoom, and 44px controls

**Copy conventions (apply to visible page text, not these docs):**

- **Outcome-led hero.** H1 is `More clients. Less admin.` (trade-off framing; since 2026-09-23 the `--g700` accent sits on "More clients.", the outcome, rather than on the thing being removed). Subhead opens broker-perspective (`We take the slow, manual parts of new business, renewals, and claims off your desk, so the same broker, in the same hours, can write more and serve clients better.`). Avoid tech-led openers like "AI that…", "Software for…", or "Operating platform for…" in this section. The eyebrow (`For Australian insurance brokers (GI)`) carries the audience targeting; the H1 carries the hook; the subhead describes what the software does.
- **No em-dashes in body copy.** The visible page intentionally avoids `—`. Substitute contextually: comma for connectors, colon for list/summary introducers, parentheses for parentheticals, period to break into two sentences. The same substitutions replace middle dots that join fragments (`Now open, six seats`, `Month one: Map`); middle dots stay only in true lists and the `<title>`.
- **Illustrations carry no numbers and say so.** The hero figure's three-to-five pace and the eight-row batch are illustrations, tagged `Example` where there is a tag, with no counts or percentages on them. Proof stays counts-only (below) until a partner signs off a figure, and the hero pace gets replaced by the measured one after Cohort 01's month three.
- **Written for brokers, not for investors or pitch-deck readers** (decided with Roshan 2026-09-07). Nothing investor-shaped above the footer: no "seed funded" badge, no patent row, no company snapshot, no market-thesis section. One audience above the fold; licensees, journalists, and investors get one quiet line in the contact panel. Camera angle is in the room with the broker: their book, their evenings, their words. Proof is counts only (four broker teams since April, first pre-renewals to real clients in August) until a partner signs off on a named quote. The design-partner offer is phrased as something a broker does ("try it on your next renewal batch", "put your hand up"), with the cohort facts underneath, never as a "program" or "seat". Cost is stated as a frame, not a figure: $100 a month for the three months; after that a monthly price per broker, no lock-in, agreed in month three against the hours saved, anchored as "a fraction of what an admin hire costs" (the offshore admin hire at roughly $1.5K to $2K a month is the comparable brokers already weigh). Roshan, 2026-09-07: the earlier $500 a user a month figure was a full-platform quote covering filing, tracking, open-market remarketing, and new business, and is not a public price. Don't publish a number until he sets one.
- **`<meta description>`** keeps the `Intelligent workflow automation software for Australian insurance brokers.` opener (different audience: search snippets and link previews benefit from the category descriptor) and must stay under ~160 characters — Bing/Google truncate longer ones and Bing Webmaster flags them.

The resources design standard explicitly says it does not apply to the marketing site. In practice this page follows the same tokens and component conventions; the differences above (visual + copy) are deliberate marketing affordances, not style drift. Note that `tenzi-resources/DESIGN_STANDARD.md` says em-dash is the preferred connector — that rule applies to resources pages, not here.

## Head & share metadata

- `<title>` is `Tenzi · More clients. Less admin.` — the title doubles as the analytics `page` key (`track.js` sends `document.title`), and the pre-redesign page was titled `More clients. Less admin.`, so the dashboard's per-page dwell table compares the two versions by these two rows. Don't casually change the title: it forks the analytics page key.
- OG/Twitter tags point at `og.png`. LinkedIn caches previews — re-scrape via LinkedIn Post Inspector after changing the card. The card doesn't include the hero figure. It was regenerated on 2026-09-23 (`?v=3`) when the headline accent moved to "More clients." and the eyebrow lost its dot; keep the card's headline and eyebrow in step with the hero. Adding the lanes to the card is optional.
- JSON-LD blocks in the head: `Organization` (legalName Tenzi Pty Ltd, founder) and `FAQPage` (must mirror the visible FAQ answers).
- **Cohort facts live in three places** — the `#cohort` section (offer panel + terms card), the FAQ (visible + schema), and `llms.txt`. Current facts: Cohort 02 now open, six seats, rolling start (seats start as they fill, no dated opening), three months, about an hour a week, $100 a month during; ongoing = a monthly price per broker, no lock-in, agreed in month three against measured hours, framed as "a fraction of what an admin hire costs" (no figure). When any of that changes, update all three together.

### Regenerating og.png

`og-frame.html` (repo root) is the card source: a fixed 1200×630 layout using the same tokens as the page. Render it at 2× — LinkedIn recompresses aggressively and a 1× card comes out blurry. From the repo root (WSL, using Windows Chrome; any Chromium works, the flags are what matter):

```bash
python3 -m http.server 8123 &    # serves the frame + logo
"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=2 --window-size=1200,630 \
  --virtual-time-budget=10000 --screenshot='C:\Users\Public\og.png' \
  'http://localhost:8123/og-frame.html'
cp /mnt/c/Users/Public/og.png og.png && kill %1
```

After deploying a new card: bump the `?v=` cache-buster on the `og:image` meta tag and re-scrape via [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

### Search & AI registration (state as of 2026-07-03)

- **Google Search Console**: domain property `tenzi.ai`, auto-verified via Google Workspace — covers every subdomain, so resources/partner never need separate verification. Sitemaps submitted for `https://tenzi.ai/sitemap.xml` and `https://resources.tenzi.ai/sitemap.xml`.
- **Bing Webmaster Tools**: imported from GSC; both sitemaps submitted. Bing matters disproportionately — its index feeds ChatGPT search.
- **robots.txt is deliberately permissive** (AI crawlers explicitly welcome) — policy, not oversight. Don't add blanket Disallows.

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
| `hero_cohort` | Hero "Try it on your next renewal batch" button | Anchors to `#cohort` |
| `hero_email` | Hero "or email roshan@tenzi.ai" link | `mailto:` |
| `cohort_card_contact` | "Put your hand up" button in the `#cohort` offer panel | Anchors to `#contact` |
| `resources_click` | "Open resources.tenzi.ai" button in the resources card | Outbound link |
| `faq_cohort` | "Put your hand up below" link in the FAQ | Anchors to `#contact` |
| `email_click` | Direct email links in the founder note and the contact panel | `mailto:` (the contact-panel one carries a `Cohort 02` subject) |
| `founder_linkedin` | Personal LinkedIn link under the founder note | Outbound |
| `founder_about` | Headshot and "More about Roshan" link in the founder note | Outbound to `resources.tenzi.ai/about.html` |
| `other_email` | "Licensee, journalist, or investor? Same address." link in the contact panel | `mailto:` |
| `contact_submit:cohort` | Cohort application form submit (auto-fired) | Interest is fixed to `cohort`; the form is brokers-only |
| `footer_resources` | Footer link to resources | Outbound |
| `footer_email` | Footer email link | `mailto:` |
| `footer_linkedin` | Footer LinkedIn link | Outbound |

Every CTA button must include `onclick="trackCta('action_name')"`. The contact form calls `trackCta()` from inside `submitContact()`.

## Contact form

Form `#contactForm` is a brokers-only Cohort 02 application. Visible fields: `name`, `email`, `organisation` (labelled Brokerage), `licensee` (free text, "own AFSL" allowed), `renewals` (select: under 20 / 20 to 50 / 50 to 150 / more than 150), `sink` (select: renewals / new business / claims / something else), `tools` (optional select, the design-partner ICP filter question: none / ChatGPT or similar now and then / building something myself), `message` (optional note). There is also a hidden **honeypot** input `website` (off-screen `aria-hidden` div) — real users never see it; bots that auto-fill all visible inputs will populate it.

On submit, `submitContact(e)`:

1. Packs the qualifying answers into the `message` field, one line each (`Licensee: …`, `Renewals a month: …`, `Biggest time sink: …`, `AI tools today: …`, `Note: …`), so the Apps Script and the `Contacts` sheet need no change. `role` is fixed to `broker` and `interest` to `cohort`.
2. Calls `tenziTrack.postForm({ source: 'holding_page_contact', name, email, organisation, role, interest, message, website })`. The shared tracker auto-adds `page`, `timestamp`, `referrer`, `site: 'marketing'`, and cached `ip`, then POSTs to the Apps Script endpoint with `mode: 'no-cors'`.
3. Fires `tenziTrack.trackCta('contact_submit:cohort')`.
4. Adds the `submitted` class to the form, swapping the input view for the success view, and moves focus to `.form-success` (`role="status"`, `tabindex="-1"`) so screen readers announce it and keyboard users aren't dropped to the top of the page.

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
2. Use existing component classes (`.section-label`, `.thesis`, `.status-card`, `.status-list`, `.contact-copy`) — do not invent new ones unless the pattern genuinely doesn't exist.
3. If the section has a CTA, wire it with `onclick="trackCta('action_name')"` and add the `action_name` to the table above.
4. Section labels can carry a short status on the right (`.section-num`) when it adds information, never a numeral. Don't reintroduce counters.
5. Push to `main` — deploys on its own.

## Things to keep working

- `<script src="https://tenzi.ai/track.js">` + `tenziTrack.init({ site: 'marketing' })` must remain at the bottom of `index.html` (everything depends on it).
- `track.js` itself must continue to be served at the repo root so `https://tenzi.ai/track.js` resolves. Do not move it into a subfolder — resources.tenzi.ai and partner.tenzi.ai load it cross-origin via that exact URL.
- The contact form POST must include `source: 'holding_page_contact'` — that's the routing flag for the Apps Script.
- `mode: 'no-cors'` on the form POST (handled inside `tenziTrack.postForm`) — without it, the cross-origin response would fail and the success view would be skipped.
- Visitor IP lookup (`api.ipify.org`) is best-effort; tracking still fires if it fails.
- `og.png`, `robots.txt`, `sitemap.xml`, and `llms.txt` are referenced by absolute `https://tenzi.ai/...` URLs (og:image tag, robots' Sitemap line) — keep them at the repo root.
- "Patent pending" appears only in the footer line. The provisional was filed 29 May 2026 (complete specification due around late May 2027). A provisional lapses 12 months after filing — pull or update the footer if it isn't converted.

## Sister project

The free-data side at `../tenzi-resources/` (repo: `rroosshhaann/tenzi-resources`) defines the design system this page inherits and owns the canonical copy of the Apps Script. Changes to design tokens or the tracking schema should be made there first; this project follows.
