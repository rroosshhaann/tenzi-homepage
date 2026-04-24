# Tenzi Homepage

Marketing holding page for `tenzi.ai`. Single self-contained HTML file, no build step.

## Hosting

GitHub Pages from `main`. Push to `main` and it deploys automatically.

## Tracking

Page views, CTA clicks and contact form submissions land in the same Google Sheet that powers `resources.tenzi.ai`:

- `Events` sheet — page views (`(page view)`) and CTA clicks (`(cta: action_name)`)
- `Contacts` sheet — full contact form payload (name, email, organisation, role, interest, message)

See `tenzi-resources/CLAUDE.md` for the Apps Script schema and routing rules.
