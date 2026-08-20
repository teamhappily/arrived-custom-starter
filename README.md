# Arrived Custom Starter

Branded event sites, your way. A Next.js starter that turns a [Happily Arrived](https://app.happily.events) event into a fully designable site — bring your event data, redesign every pixel.

## How it works

The starter ships a complete event site out of the box — hero, agenda, speakers, sponsors, FAQ, registration, the lot. You create an event in Happily, point this starter at it, and redesign the `components/` directory however you want. The data layer and registration handle themselves; you focus on look-and-feel. Deploy anywhere Next.js runs (Vercel is the easy path).

Design references and starting-point templates live in Figma: [Design Templates](https://www.figma.com/design/k8CN5DFdzpeLCYfhXZmpeT/Design-Jam-Templates). Use them as inspiration or ignore them — your call.

## Prerequisites

- Node 20+ and npm
- A Happily Arrived account — sign up at [app.happily.events](https://app.happily.events)

## Get started

### 1. Create your event

1. Sign in to [app.happily.events](https://app.happily.events).
2. Click **Create Event** and fill out the basics. You don't need to publish yet: preview mode (described below) reads drafts.
3. Once created, you'll land on the event editor. Your event ID is in the URL: `app.happily.events/<EVENT_ID>/...` — copy that ID.

### 2. Fork and clone

1. Click **Fork** at the top of [the starter repo on GitHub](https://github.com/teamhappily/arrived-custom-starter) to create your own copy. Forking (instead of cloning directly) lets us see who's building with the starter and lets you push your customizations to your own GitHub.
2. Clone your fork and install dependencies:
   ```bash
   git clone git@github.com:<your-username>/arrived-custom-starter.git
   cd arrived-custom-starter
   npm install
   ```

### 3. Configure

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your event ID into `HAPPILY_EVENT_ID`. That is the only required variable: the API URLs default to production in code. The commented-out variables are optional overrides for development (for example, pointing at a locally running CMS).

### 4. Generate the API types

```bash
npm run api:types
```

Fetches the live OpenAPI schema and writes typed bindings to `lib/happily/generated/schema.d.ts`. Re-run any time the API changes.

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your event site renders with whatever content you've entered in Happily. Edits in the CMS show up here on refresh. If you haven't published your event yet, you'll see a "Not found" page: open [http://localhost:3000/?preview=true](http://localhost:3000/?preview=true) instead to see your draft.

### 6. Preview your draft

The site shows your published event by default. To see unpublished changes, open any page with `?preview=true`:

```
http://localhost:3000/?preview=true
```

This is the same URL the **Preview changes** button in Happily opens. Preview sticks for the rest of your browser session (it is stored in a session cookie), so internal navigation stays in preview. Append `?preview=false` to go back to the published site, or just close the browser. If you prefer the site to always render your draft locally, set `HAPPILY_EVENT_ENV=staging` in `.env.local` instead.

Preview is handled by `proxy.ts` at the repo root (Next.js 16 renamed `middleware` to `proxy`). If your fork carries a custom `middleware.ts`, consolidate its logic into `proxy.ts`.

## Analytics

If analytics is configured for your event in Happily, the starter automatically injects the tracking script on the published site. There is nothing to configure: the analytics ID comes from the event payload. The script is not injected in preview mode or when fetching staging data, so your metrics only count real visits.

## What's where

- `components/` — **all the visual stuff.** Every section (hero, agenda, speakers, sponsors, FAQ, registration, footer, etc.) lives here. Redesign freely.
- `components/ui/` — shadcn primitives (button, input, etc.) styled with Tailwind v4. Use them or replace them.
- `app/(event)/` — the route pages (home, confirmation, livestream, photos). Thin wrappers — touch these to change page composition, not visuals.
- `lib/happily/` — API client and data queries. Leave alone unless you're pulling new fields from the API.
- `app/globals.css` — global styles. Event-specific colors come from CSS variables (`--event-primary-bg`, `--event-accent-text`, etc.) set automatically from your event's design tokens.

## Customizing

- **Colors and fonts.** Design tokens come from your event's settings in Happily, applied as CSS variables in `app/(event)/layout.tsx`. Hardcode in components only when you want a per-section override.
- **Tailwind v4 CSS-var syntax.** Use `bg-(--event-primary-bg)`, *not* the older `bg-[var(--event-primary-bg)]` arbitrary-value form. Match the surrounding code.
- **Add a section.** Drop a new component into `components/`, then render it from `components/event-page.tsx`.
- **Feature toggles.** The photos page, livestream, calendar buttons, and registration CTA are gated by fields on the event payload (`event.photos_toggle`, `event.live_toggle`, `event.display_add_to_calendar`, `event.display_settings.*`). Toggle them in the Happily CMS to show or hide the corresponding sections.

## Registration

The registration form submits via a server action (`app/actions/register.ts`) to the Happily API. It sends attendee data only — Happily handles confirmation emails on the server. Any custom form fields you add in the Happily CMS show up automatically.

Errors to expect on the form: `CAPACITY_REACHED`, `DUPLICATE_EMAIL`, `VALIDATION_ERROR`.

## Deploy to Vercel

1. Push your branch to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Under **Environment Variables**, add `HAPPILY_EVENT_ID` with your event ID. That is the only variable a standard deploy needs.
4. Click **Deploy**.

That's it. The generated API types (`lib/happily/generated/schema.d.ts`) are committed to the repo, so the build works out of the box. If you ever want fresh types on every deploy, change the Vercel build command to `npm run api:types && npm run build`.

## API reference

- Endpoint docs: [app.happily.events/api/docs](https://app.happily.events/api/docs)
- OpenAPI schema: [app.happily.events/api/openapi.json](https://app.happily.events/api/openapi.json)
- Domain types: `lib/happily/types.ts` (re-exports from the generated schema — import from here, not from `generated/schema`)

## Troubleshooting

- **`Missing HAPPILY_EVENT_ID in .env.local`**: you skipped step 3, or the file is empty. Run `cp .env.example .env.local` and paste your event ID.
- **`Failed to fetch OpenAPI schema`**: check that you have network access. If you set the `HAPPILY_API_SCHEMA_URL` override, make sure it points at a reachable schema URL.
- **"Not found" page at `/`**: wrong `HAPPILY_EVENT_ID`, or the event isn't published yet (the site fetches published data by default). Open the page with `?preview=true` or set `HAPPILY_EVENT_ENV=staging` while drafting.
- **Styles look broken**: run `npm run api:types` once to make sure the generated schema is up to date.

## Resources

- [Happily Arrived](https://app.happily.events) — the CMS
- [Product overview](https://teamhappily.com/arrived/)
- [Design templates (Figma)](https://www.figma.com/design/k8CN5DFdzpeLCYfhXZmpeT/Design-Jam-Templates)
- [API reference](https://app.happily.events/api/docs)
- [Discord community](https://discord.com/invite/d7HnMZfvB7) — questions, show-and-tell, help
