---
name: happily-api
description: Use when writing or modifying code that touches the Happily Arrived API in this repo — adding queries, wrapping new endpoints, debugging the registration server action, regenerating types, or building feature-gated event customizations. Trigger even when the user doesn't say "Happily" explicitly: any work in `lib/happily/`, `app/(event)/`, `app/actions/register.ts`, or the `<RegistrationForm>` component qualifies, as does any mention of `happilyClient`, `getPublicEvent`, `getPublicPhotos`, `getPublicAttendees`, `submitRegistration`, the event payload, `event.styles`, `display_settings`, `photos_toggle`, `live_toggle`, or `HAPPILY_*` env vars. If the user asks "how do I fetch X from the event API" or "wire up a new endpoint" in this codebase, that's this skill.
---

# Using the Happily Arrived API

This repo wraps the public Happily Arrived API in `lib/happily/`. The wrapper has a small surface area, but several patterns are load-bearing — code that bypasses them will compile and look fine yet quietly break in production (the confirmation page, the registration flow, or type safety). Read this before adding endpoints, debugging the registration server action, or touching anything under `lib/happily/`.

## The canonical surface

There is one rule that subsumes most others: **app code goes through `lib/happily/queries.ts`, never directly through `happilyClient`** (the one exception is the registration server action — see below).

`lib/happily/queries.ts` exports three async functions. Each is the *only* intended entry point for its endpoint:

| Function | Endpoint | Return on missing |
| --- | --- | --- |
| `getPublicEvent` | `GET /api/public/{eventId}` | throws `notFound()` |
| `getPublicPhotos` | `GET /api/public/{eventId}/photos` | throws `notFound()` |
| `getPublicAttendees` | `GET /api/public/{eventId}/attendees` | **returns `null`** |

All three accept `{ eventId?, env? }` (plus `page` / `pageSize` where pagination applies) and default to `getEventId()` / `getEventEnv()` from `lib/happily/config.ts`. Callers usually pass nothing.

```ts
import { getPublicEvent } from "@/lib/happily/queries";

export default async function Page() {
  const eventData = await getPublicEvent();
  // eventData is PublicEventData — fully typed, no nullable, throws on miss
}
```

### The asymmetry is load-bearing

The fact that `getPublicAttendees` returns `null` instead of throwing is not an oversight — `app/(event)/confirmation/page.tsx` relies on it. The confirmation page renders an attendees list only when `event.content.displayAttendeesList === true`, and even then a failed attendees fetch should *not* turn the confirmation page into a 404 (the user just registered; show them confirmation). So attendees swallows errors to `null`.

If you find yourself "normalizing" these three functions to behave the same, stop — you'll silently break confirmation. If you're adding a fourth query, pick an error style deliberately:

- **Throw `notFound()`** for fetches whose absence means the page can't render meaningfully (e.g., the event itself, a gallery page when there are no photos).
- **Return `null`** for fetches that decorate an otherwise-valid page (e.g., sponsors strip, attendees list, social proof).

State the choice in a short comment so future readers don't "fix" it.

## Adding a new endpoint

When you wrap a new endpoint (say `/api/public/{eventId}/sponsors`):

1. Regenerate types first if the endpoint is new in the upstream schema: `npm run api:types`. Then the endpoint path and response type are available in `lib/happily/generated/schema.d.ts`.
2. Add a domain type alias in `lib/happily/types.ts` (e.g., `export type PublicSponsorsData = components["schemas"]["PublicSponsorsApiResponse"];`).
3. Add a function in `lib/happily/queries.ts` next to the existing three, following the same pattern: destructure `{ eventId = getEventId(), env = getEventEnv(), ... }`, call `happilyClient.GET("/api/public/{eventId}/sponsors", { params: { path: { eventId }, query: { env } } })`, choose your error style.
4. Import from `lib/happily/queries` in the page/component that consumes it. Render in a server component by default.

Do **not** call `happilyClient.GET` directly from a page. The wrapper exists so error handling, env injection, and types stay consistent.

## Types: import from `lib/happily/types`

`lib/happily/types.ts` is the public type surface. It re-exports a handful of named aliases from the generated schema:

- `HappilyEnv` — `"staging" | "prod"`
- `PublicEventData` — full response of `getPublicEvent`
- `PublicEvent` — `PublicEventData["event"]` (the nested event object you'll touch most)
- `PublicForm` — `NonNullable<PublicEventData["form"]>`
- `PublicPhotoData`, `PublicAttendeesData`
- `RegistrationFormType` — literally `2 | 3` (see registration section)

**Always import from `@/lib/happily/types`, never from `@/lib/happily/generated/schema`.** The generated file is regenerated wholesale every time the API changes; deep imports rot. The re-export layer is the stable contract.

## Type regeneration

`lib/happily/generated/schema.d.ts` is produced by `scripts/generate-api-types.mjs` and is **read-only**. Don't hand-edit it. To pick up an upstream API change:

```bash
npm run api:types
```

This fetches the OpenAPI schema from `HAPPILY_API_SCHEMA_URL` (or `${HAPPILY_API_SCHEMA_URL}/api/openapi.json`), applies a `schema.definitions ??= schema.components.schemas` workaround for an upstream `$ref` quirk, and overwrites `schema.d.ts`. The script loads `.env.local` manually — there is no dotenv dependency — so make sure the env vars are present there.

If a TypeScript error claims a field doesn't exist after the upstream API added it, the regeneration step was skipped. Run it.

## Environment variables

Four env vars drive the integration. Set them in `.env.local`:

| Var | Required | Validated by | Notes |
| --- | --- | --- | --- |
| `HAPPILY_API_BASE_URL` | yes | `lib/happily/client.ts` (implicitly) | Base URL for `openapi-fetch`. |
| `HAPPILY_API_SCHEMA_URL` | yes (for `api:types`) | `scripts/generate-api-types.mjs` | Used only at type-generation time. |
| `HAPPILY_EVENT_ID` | yes | `getEventId()` — throws `"Missing HAPPILY_EVENT_ID in .env.local"` | The event this customization renders. |
| `HAPPILY_EVENT_ENV` | optional | `getEventEnv()` — falls back to `"staging"` | Only `"prod"` or `"staging"` are accepted; anything else silently becomes `"staging"`. |

`getEventId()` and `getEventEnv()` are the validators — call them rather than reading `process.env` directly anywhere in app code.

## Registration

Registration is the one place that legitimately calls `happilyClient` directly — from the server action at `app/actions/register.ts`. The flow:

1. `<RegistrationForm>` (`components/registration-form.tsx`, `"use client"`) is the only data-mutating client component. It uses React 19's `useActionState` against `submitRegistration`.
2. `submitRegistration(config, _previousState, formData)` reads from the `FormData`, builds a request body, and POSTs to `/api/events/{eventId}/register`.
3. Returns `{ ok: true, message }` on success, `{ ok: false, message: error.error }` on failure. If `config.redirectTo` is set on success, calls `redirect()` — which *throws* a redirect signal and the action never returns normally.

### `<RegistrationForm>` is rendered in two places — and they behave differently

This is the single most important fact about the registration flow. It is rarely top-of-mind and it shapes every debugging conversation:

| Render site | `formType` | `redirectTo` | What success looks like |
| --- | --- | --- | --- |
| `components/event-page.tsx` (main registration) | `2` (default) | `"/confirmation"` | Browser navigates to `/confirmation`. User does **not** see the green "Submitted successfully" banner. |
| `components/livestream-gate.tsx` (livestream access) | `3` | *unset* | Page stays put. User **does** see the green "Submitted successfully" banner. |

This is the upstream `form_type` distinction surfacing in the UI. `form_type: 2` → main event registration; `form_type: 3` → livestream access. They may land in **different tabs/sections of the Happily dashboard**. If you're debugging "they registered but I can't find them," knowing which form they used decides where to look.

Anyone building a custom form variant must pick one of these two patterns deliberately — leaving `redirectTo` off a `formType={2}` form will keep the user on the page with a confusing "Submitted successfully" banner that resembles the livestream gate.

### Field-name aliases

`submitRegistration` accepts either casing for each core field, returning the first non-empty value:

- `firstName` ↔ `first_name`
- `lastName` ↔ `last_name`
- `email` ↔ `emailAddress` ↔ `email_address`

When you build a form, use whichever input names feel right — the server action normalizes them. Matching is case-sensitive: `EmailAddress` (capital E, capital A) does **not** match `emailAddress`. Email is the only field that errors on missing (`"Email is required."`); first/last name silently pass through as empty strings, which means a mismatched name field produces nameless dashboard rows that users will describe as "missing."

### The `data` blob

Every other `FormData` key (except `$ACTION_*` Next.js internals, which are skipped) gets collected into a `data: Record<string, unknown>` object sent to the API. Single values become strings; multi-values (e.g., a checkbox group with the same `name`) become arrays. This is how custom form schema fields make it through — you don't need to plumb them explicitly.

### Hardcoded fields

`status: "APPROVED"` is hardcoded; this isn't a setting. `form_type` is `2` (main registration) or `3` (livestream access) — only those two values. `RegistrationFormType` enforces this at the type level.

### Debugging "registration succeeded but never showed up"

When users report this symptom, work the hypotheses in this order — they are listed from most to least likely based on how easy each is to misconfigure:

1. **Wrong environment.** `getEventEnv()` silently returns `"staging"` for anything that isn't exactly `"prod"` or `"staging"` (typos like `"production"`, `"PROD"`, trailing whitespace, or an unset var). Submissions go to the staging dashboard while the user watches prod. First check: log into the staging Happily dashboard for the same event ID. If the missing registrations are there, you've found it. Verify `HAPPILY_EVENT_ENV` *in the deployed runtime*, not in your local `.env.local`.
2. **Wrong form / wrong tab.** Ask which form the user submitted. If they saw the "Submitted successfully" banner, they were on the livestream gate (`form_type: 3`) — check that tab in the dashboard, not the main registrations list. (See the two-render-sites table above.)
3. **Field-name mismatch.** Add `console.log("register entries", [...formData.entries()])` at the top of `submitRegistration` and capture a failing submission. Cross-reference field IDs against the alias list. A misnamed name field produces empty-string `firstName`/`lastName` and a dashboard row searchable only by email.
4. **Swallowed response details.** Temporarily log the full openapi-fetch response (`{ status: response.status, data, error }`) — the action currently discards `data`. A 200 with no `registration.id`, or a non-2xx error body the schema didn't declare, would otherwise be invisible.
5. **Duplicate-email idempotency.** Some APIs treat repeat emails as 200-but-no-new-record. If "some users" are repeat submitters, that maps cleanly. Confirm with Happily support.

Don't refactor the action ("validate more strictly", "throw on missing name") as your first move — that risks breaking currently-working registrations. Instrument first, then change.

## Feature gating

There is no central `event.features` flag. Gating is per-toggle, read directly off the event payload:

| Flag | Common use site |
| --- | --- |
| `event.photos_toggle` | Gallery link in nav, `/photos` page |
| `event.live_toggle` | `/livestream` page, livestream form |
| `event.display_add_to_calendar` | Calendar buttons on home/confirmation |
| `event.display_settings.buttonLinks.navCTA.display` | Nav CTA button |
| `event.display_settings.hideNavigation` | Whether to show the nav at all |
| `event.content.displayAttendeesList` | Confirmation page attendees |
| `eventData.form?.is_active`, `eventData.form?.at_capacity` | Whether to show the registration form |

When you add a new gated section, follow the same pattern — read the flag off the payload, don't introduce a parallel feature-flag system. If the flag doesn't exist on the schema yet, add it upstream and regenerate types.

## Conventions

- **Server-by-default.** Queries are bare `await` calls in async server components. Don't add `"use client"` reflexively — only when there's real interactivity (the registration form is one of the few legitimate cases).
- **No explicit fetch caching directives.** The queries don't pass `{ cache: ... }` or `revalidate`. If you need revalidation for a specific page, decide deliberately and document why.
- **Reuse existing helpers before writing new ones.** `components/helpers.ts` has `text`, `hasText`, `styleValue`, `formatEventDate`, `eventDateRange`, `ordered`, `heroImage` — most event fields are nullable and these are the established fallback patterns. `lib/happily/calendar.ts` has Google/Outlook/Office365/Yahoo URL builders and ICS generation; don't hand-roll calendar logic.

## Anti-patterns

- ❌ Calling `happilyClient.GET("/api/public/...")` directly from a page or component. Add a query function instead.
- ❌ Editing anything under `lib/happily/generated/`. Regenerate with `npm run api:types`.
- ❌ Importing types from `@/lib/happily/generated/schema`. Use `@/lib/happily/types`.
- ❌ Making all three query functions throw (or all three return null). The asymmetry is intentional and load-bearing for the confirmation page.
- ❌ Introducing a central `event.features` flag. Gating reads per-toggle off the payload.
- ❌ Reading `process.env.HAPPILY_*` directly in app code. Use `getEventId()` / `getEventEnv()`.
- ❌ Adding a registration field by inputing `Email` (capital E) or similarly off-spec name. The action only checks the three documented aliases.

## External references

- API docs: <https://app.happily.events/api/docs>
- OpenAPI schema: <https://app.happily.events/api/openapi.json>

These are the upstream source of truth. When the API changes, both the docs and the schema URL update — regenerate types and re-read this skill if a wholesale change is rolled out.
