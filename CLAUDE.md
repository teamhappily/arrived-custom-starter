# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read the docs first

This repo pins **Next.js 16.2.6** and **React 19.2.4**. APIs, conventions, and file structure differ
from older Next. Before writing or modifying code that touches routing, caching, metadata, server
components, or server actions, read the relevant guide in `node_modules/next/dist/docs/` (Next ships
its full docs there; available after `npm install`). Heed deprecation notices.

## Commands

```bash
npm install
cp .env.example .env.local    # fill in HAPPILY_EVENT_ID before anything else
npm run api:types             # regenerate lib/happily/generated/schema.d.ts from the live OpenAPI schema
npm run dev                   # http://localhost:3000
npm run build
npm run start
npm run lint                  # bare `eslint` (flat config), not `next lint`
```

Env vars: only `HAPPILY_EVENT_ID` is required. The rest are optional overrides:
`HAPPILY_API_BASE_URL` (defaults to `https://app.happily.events` in code),
`HAPPILY_API_SCHEMA_URL` (used only by `api:types`; defaults to the schema URL derived from the
base URL), and `HAPPILY_EVENT_ENV` (`staging` | `prod`, defaults to `prod` — the published event;
anything else silently becomes `prod`). All are server-side only.

`npm run api:types` runs `scripts/generate-api-types.mjs`, which parses `.env.local` itself (no
dotenv dep), fetches `HAPPILY_API_SCHEMA_URL` (or derives it from `HAPPILY_API_BASE_URL` +
`/api/openapi.json` when unset), aliases `schema.definitions ??= schema.components.schemas`
(workaround for an upstream `$ref` quirk), and writes the generated file. Run it whenever the
upstream API changes. `lib/happily/generated/` is committed but effectively read-only —
regenerate, never hand-edit.

**There is no test runner in this repo.** Verify changes with `npm run lint` and `npm run build`.

## Architecture

A single-event marketing/registration site. There is no database and no local content: env vars
select which Happily event to render, and the entire page is fetched server-side at request time.

**Data flow (one-way, server-only):**

`HAPPILY_*` env → `lib/happily/config.ts` (`getEventId` throws if unset; `getApiBaseUrl` defaults
to production; `getEventEnv` normalizes to `prod`) → `lib/happily/client.ts` (single
`openapi-fetch` client typed against generated `paths`) → `lib/happily/queries.ts` → async server
components in `app/(event)/` → presentational components in `components/`.

Inside a request, the env comes from `resolveEventEnv()` (preview-aware), not `getEventEnv()`
directly: the queries call it themselves when no `env` is passed, so layout, `generateMetadata`,
and page resolve the same env and Next dedupes the identical fetches.

**Preview mode.** `proxy.ts` at the repo root (Next 16 renamed `middleware` to `proxy`) is the only
place that interprets `?preview=true`/`?preview=false` and the `happily-preview` session cookie; it
translates them into an internal request header (constants in `lib/happily/preview.ts`, which must
stay free of runtime imports). Server code reads only the header, via `resolveEventEnv()` /
`isPreviewRequest()` in `config.ts` — never the URL or cookies. Preview requests render draft
(staging) data plus the `<PreviewBanner>` (kit chrome, no `--event-*` vars; its "Exit preview" link
is a plain `<a>` on purpose — a `<Link>` would soft-navigate and the layout, banner included, does
not re-render on soft navigations, and an anchor never prefetches the cookie-clearing URL).
Reading `headers()` makes every `(event)` route dynamic (`ƒ` in the build output) — expected.

**Analytics.** `app/(event)/layout.tsx` injects a `<script defer>` (native, not `next/script`)
pointing at `https://hx.happily.events` when `env === "prod"` **and** `event.analytics_id` is set —
never in preview or staging, so metrics only count real visits. Keep all analytics naming
vendor-neutral (host, comments, docs) — it's "analytics", nothing more specific.

`queries.ts` exports the three canonical entry points — reuse them rather than calling
`happilyClient` directly (the registration action is the one deliberate exception):

| Function | Endpoint | On missing |
| --- | --- | --- |
| `getPublicEvent` | `GET /api/public/{eventId}` | `notFound()` |
| `getPublicPhotos` | `GET /api/public/{eventId}/photos` | `notFound()` |
| `getPublicAttendees` | `GET /api/public/{eventId}/attendees` | returns `null` |

That asymmetry is load-bearing: the confirmation page renders with or without an attendee list.
Don't "normalize" it without checking callers.

**Layout vs. shell — don't conflate them.** `app/(event)/layout.tsx` is the Next.js layout: it
fetches the event, maps `event.styles` onto the nine `--event-*` CSS custom properties on `<body>`
(via `styleValue()` from `components/helpers.ts`, which supplies the fallbacks), derives
title/description/robots/OG in `generateMetadata` from `event.metadata`, and owns the analytics
script gate and the `<PreviewBanner>` (see above). Theming changes go here.
`components/event-shell.tsx` is a *presentational* wrapper rendered inside that layout: it owns
`Header`/`Footer` and builds the nav. Structural changes go there.

**Page composition** lives in `components/event-page.tsx`. Each section (about, agenda, speakers,
register, host, sponsors, faqs) renders only when its data or content is non-empty. Adding a section
means dropping a component into `components/` and rendering it from here. Conditional pages
(`confirmation`, `livestream`, `photos`) are sibling routes in the `(event)` group and call
`notFound()` themselves when their toggle is off.

**Feature gating.** There is no central `event.features` object. Conditionals read straight off the
event payload: `event.photos_toggle`, `event.live_toggle`, `event.display_add_to_calendar`,
`event.display_settings.{buttonLinks,hideNavigation}`, `event.content.displayAttendeesList`, plus
sub-resource flags like `photo_gallery.enabled` and `livestream.enabled`. Grep for these names when
adding a gated section.

**Registration.** `<RegistrationForm>` (`"use client"`) drives React 19's `useActionState` against
`submitRegistration` in `app/actions/register.ts`, bound with config first — signature is
`(config, prevState, formData)`. The form itself renders from `form.content.formSchema` +
`fieldOrder`, and handles `!form.is_active` / `form.at_capacity` client-side before ever submitting.
The action:
- accepts `firstName`/`first_name`, `lastName`/`last_name`, `email`/`emailAddress`/`email_address`
  interchangeably (`CORE_FIELD_KEYS`);
- folds every *other* `FormData` key into a custom `data` object, skipping keys starting with
  `$ACTION_` (Next.js internals) — so custom CMS fields flow through with no code change;
- `POST`s to `/api/events/{eventId}/register` and returns `{ ok, message }`, where `message` is the
  raw API error string. There is no error-code field on `RegistrationState`.

Only attendee data is sent; the API sends the confirmation email.

**Domain types.** Import event types from `lib/happily/types.ts` (`PublicEventData`, `PublicEvent`,
`PublicForm`, `PublicPhotoData`, `PublicAttendeesData`, `HappilyEnv`, `RegistrationFormType`), not
from `generated/schema`.

**Reuse before writing new utilities:**
- `components/helpers.ts` — `text`, `hasText`, `styleValue`, `heroImage`, `formatEventDate`,
  `eventDateRange`, `eventTimeRange`, `ordered`. Most event fields are nullable; these are the
  established fallback patterns.
- `lib/happily/calendar.ts` — Google / Outlook / Office365 / Yahoo URL builders, ICS generation and
  download. Use these before hand-rolling calendar logic.
- `lib/utils.ts` — `cn` (clsx + tailwind-merge) and `scrollToTargetAdjusted` (sticky-header-aware
  smooth scroll).

## Conventions and gotchas

- **Tailwind v4 with an explicit source list.** `app/globals.css` uses
  `@import "tailwindcss" source(none)` plus `@source "../app"` and `@source "../components"`. Classes
  in any *new* top-level directory are not scanned until you add an `@source` line for it.
- **Tailwind v4 native CSS-var syntax**: `bg-(--event-primary-bg)`, `text-(--event-base-text)` — not
  the older `bg-[var(--event-primary-bg)]` arbitrary-value form. Match the surrounding code.
- **`<Container>` is a `<section>`, not a `<div>`.** `wrapperClassName` styles the outer full-bleed
  section (use for backgrounds); `className` styles the inner `max-w-7xl` div (use for layout).
  Mixing these up is the most common silent bug when restyling a section.
- **`next/image` with `unoptimized: true`** (`next.config.ts`). Source images must already be sized
  appropriately; don't rely on the Next image optimizer.
- **Server components by default.** Only a handful of interactive components carry `"use client"`.
  Don't add it reflexively — check whether a server component will do.
- **No explicit fetch caching directives.** Queries are bare `await` calls. If you need revalidation,
  decide deliberately.
- **shadcn primitives** live in `components/ui/` (`radix-vega` style, `lucide` icons; see
  `components.json`). Path alias `@/*` maps to the repo root.
- **Customization scope:** everything in `components/` is meant to be redesigned per-event. The data
  layer (`lib/happily/`) and the registration contract stay the same — don't fork them per event.
- `internal-app-that-has-api-routes/` is excluded in `tsconfig.json` and `eslint.config.mjs`. It is
  not part of this starter and does not exist in the tree; leave the exclusions alone.

## Skills

Two repo-local skills carry the deep detail and auto-trigger by topic — prefer them over re-deriving:

- `.claude/skills/happily-api/` — data layer, queries, registration action, type generation.
- `.claude/skills/event-components/` — the `components/` presentation layer, theming, gating.

## Reference

- API docs: `https://app.happily.events/api/docs`
- OpenAPI schema: `https://app.happily.events/api/openapi.json`
