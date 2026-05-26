---
name: event-components
description: Use whenever working with files under `components/` in this repo — redesigning a section per-event, adding a new section, theming, wiring event data into UI, or deciding whether to gate something on a `*_toggle` / `display_settings.*` flag. Trigger even when the user doesn't say "component": phrases like "change the hero copy", "add an FAQ section", "restyle the speakers grid", "make the register button teal", "hide the agenda on this event", "the sponsors look wrong", or any reference to `EventShell`, `EventPage`, `HeroSection`, `ContentSection`, `AgendaList`, `SpeakersGrid`, `SponsorsGrid`, `FaqList`, `RegistrationForm`, `Container`, `SectionHeading`, the `--event-*` CSS vars, or the `components/ui/` shadcn primitives all qualify. If the work is purely data-layer (`lib/happily/`), use the `happily-api` skill instead.
---

# Working with event components

The `components/` directory is the **presentation layer** of this custom-starter repo. Every component there is meant to be redesigned per-event — that's the whole point of forking the starter. The data layer (`lib/happily/`) and the routes (`app/(event)/`) stay the same across forks; you customize visuals, copy, layout, and gating in `components/`.

This skill captures the patterns and gotchas for working in that layer. For wiring new endpoints, registration debugging, or anything under `lib/happily/`, use the `happily-api` skill — they're meant to be used together.

## The three-layer mental model

```
lib/happily/queries.ts          → fetches raw event payload (PublicEventData)
        ↓
app/(event)/layout.tsx          → sets CSS vars on <body> from event.styles
app/(event)/page.tsx            → passes eventData into EventPage
        ↓
components/event-shell.tsx      → header / footer / nav
components/event-page.tsx       → composes sections, reads gates, picks fallbacks
components/<section>.tsx        → presentation only — receives raw event payloads
```

When you're customizing, you're operating in the **bottom box**. Don't reach up — if a section needs different data, the answer is almost always "the field already exists on `event.content` or `event.display_settings`, you just haven't wired it." Grep before adding a query.

Two distinctions worth holding in your head:

- **Layout vs. shell.** `app/(event)/layout.tsx` is the Next.js layout — it fetches `event.styles` and sets the nine `--event-*` CSS variables on `<body>`. `components/event-shell.tsx` is a *presentational* wrapper rendered inside that layout — it owns the Header, Footer, and nav. Don't conflate them; theming changes go in the layout, structural changes go in the shell.
- **Container vs. div.** `<Container>` is a `<section>` (see `components/container.tsx:16`), not a `<div>`. `wrapperClassName` styles the outer section (use this for full-bleed backgrounds), `className` styles the inner `max-w-7xl` div (use this for content layout). Mixing these up is the most common silent bug when restyling a section.

## Feature gating: where to put the conditional

This is the single most common place sessions go wrong. **Gates live at the composition layer (`event-page.tsx` / `event-shell.tsx`), not inside the section component.** A section component receives data and renders it; it doesn't know whether it should exist. The parent decides.

Why this matters: if you bury the gate inside `<HeroSection>`, the next person who composes a custom variant of HeroSection has to re-implement the gate or accidentally bypasses it. Keeping gates at the composition layer makes the page file the single source of truth for "what shows up on this event."

The gates that already exist:

| Flag | Read at | Controls |
| --- | --- | --- |
| `event.photos_toggle` | `event-shell.tsx:26` | Gallery link in nav |
| `event.live_toggle` | route-level | `/livestream` page, livestream form |
| `event.display_add_to_calendar` | calendar buttons | AddToCalendar visibility |
| `event.display_settings.hideNavigation` | `event-shell.tsx:41` (`?? false`) | Whether the nav renders at all |
| `event.display_settings.buttonLinks.navCTA.display` | `event-shell.tsx:32` | Nav CTA button |
| `event.display_settings.buttonLinks.heroCTA.display` | `hero-section.tsx` | Hero CTA button |
| `event.display_settings.displayLocation` | `event-details.tsx:21` (`?? true`) | Location in event details strip |
| `event.display_settings.displayDate` | `event-details.tsx:23` (`?? true`) | Date in event details strip |
| `event.display_settings.displayTime` | `event-details.tsx:24` (`?? true`) | Time in event details strip |
| `form.is_active`, `form.at_capacity` | `event-page.tsx`, `registration-form.tsx` | Registration form |
| `event.content.displayAttendeesList` | confirmation page | Attendees list |

**Decision rules when adding a section:**

1. Does the data type already have a flag? Use it. (Photos has `photos_toggle`, livestream has `live_toggle`, etc.)
2. Is the section just empty when there's no data? Prefer `array.length` / `hasText()` checks over inventing a flag. See `event-page.tsx:38` (`sessions.length ? ... : null`) — agenda doesn't need a flag because the empty state *is* the gate.
3. Does it have a `display_settings.*` field? Default to true: `event.display_settings.someFlag ?? true`. Mirror the pattern in `event-details.tsx:21-24`.
4. Don't invent a parallel feature-flag system. There is no `event.features.*` — each gate is its own field on the payload.

**Where to put the conditional:**

```tsx
// event-page.tsx — gate at the composition layer
{event.photos_toggle && photos.length ? (
  <PhotosGrid photos={photos} />
) : null}
```

Not:

```tsx
// inside photos-grid.tsx — DON'T do this
export function PhotosGrid({ event, photos }) {
  if (!event.photos_toggle) return null;  // ❌ gate buried in section
  // ...
}
```

The exception: if a flag controls a *sub-feature* of a section (e.g., one field within event details), gate inside — `event-details.tsx` does this correctly because the flags control individual list items, not the whole section.

## Helpers cheatsheet

All in `components/helpers.ts`. Most event fields are nullable — reach for these before writing your own fallback logic.

| Helper | When to use | One-liner |
| --- | --- | --- |
| `text(value, fallback)` | Display a nullable string with a default | `text(content.aboutTitle, "About")` |
| `hasText(value)` | Decide whether to render a section based on a string field | `hasText(content.aboutDescription) ? <ContentSection /> : null` |
| `styleValue(styles, key, fallback)` | Read a nullable style value with a hex default | `styleValue(styles, "baseText", "#171717")` |
| `formatEventDate(date, tz, opts)` | Format any single date with Intl + the event's timezone | `formatEventDate(session.start_time, event.timezone, { weekday: "long" })` |
| `eventDateRange(event)` | "March 5, 2026 - March 7, 2026" (collapses single-day) | `eventDateRange(event)` |
| `eventTimeRange(event)` | "10:00 AM - 4:00 PM" in the event's timezone | `eventTimeRange(event)` |
| `heroImage(content)` | Falls back from `heroImage` → `heroGraphic` → `null` | `const image = heroImage(content)` |
| `ordered(items)` | Sort by `.order` (nulls last) — for speakers, FAQs, sponsors | `ordered(speakers).map(...)` |

If you find yourself writing `value?.trim() || "default"`, that's `text()`. If you find yourself writing `arr.sort((a, b) => a.order - b.order)`, that's `ordered()`. Don't reinvent.

## Theming: CSS variables + Tailwind v4 syntax

Themes are data-driven. `app/(event)/layout.tsx:39-49` reads `event.styles` and sets nine CSS custom properties on `<body>`:

```
--event-primary-bg     --event-primary-text     // high-emphasis (nav CTA)
--event-secondary-bg   --event-secondary-text   // secondary surfaces (footer)
--event-accent-bg      --event-accent-text      // highlights (hero CTA, register bg)
--event-base-bg        --event-base-text        // default page surface
--event-border-radius                           // rounded-* values
```

**Use the Tailwind v4 native CSS-var syntax**, not the older arbitrary-value form:

```tsx
// ✅ correct — Tailwind v4 native CSS-var syntax
<div className="bg-(--event-accent-bg) text-(--event-accent-text)" />

// ❌ wrong — this is the v3 / arbitrary-value form. Don't use.
<div className="bg-[var(--event-accent-bg)] text-[var(--event-accent-text)]" />
```

The codebase is uniform on this — matching grep results is the fastest way to confirm what to write.

**Which pair to use:**

- `primary` — primary CTAs that need maximum contrast against the page (nav register button, form submit button)
- `accent` — visual punch on highlight sections (hero CTA, register section background, callouts)
- `base` — default page background and text — your "rest state"
- `secondary` — quieter surfaces (footer, subdued accents)

Don't introduce new `--event-*` vars without updating `layout.tsx` and either adding to `event.styles` upstream or hard-coding a fallback in `styleValue()`. If you just need a one-off color for a single event customization, prefer a plain Tailwind class — CSS vars are for things that vary across events.

## Composition pattern: adding a new section

Most new sections follow the same shape. Copy this and adapt:

```tsx
// components/testimonials.tsx — server component by default
import type { PublicEventData } from "@/lib/happily/types";

import { Container } from "./container";
import { SectionHeading } from "./section-heading";
import { hasText, ordered, text } from "./helpers";

type TestimonialsProps = {
  event: PublicEventData["event"];
  testimonials: PublicEventData["testimonials"];
};

export function Testimonials({ event, testimonials }: TestimonialsProps) {
  if (!testimonials?.length) return null;
  const { content } = event;

  return (
    <Container id="testimonials" wrapperClassName="bg-(--event-base-bg)">
      <SectionHeading
        title={text(content.testimonialsTitle, "What people say")}
        description={content.testimonialsDescription}
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {ordered(testimonials).map((t) => (
          <article key={t.id} className="rounded-(--event-border-radius) ...">
            {/* ... */}
          </article>
        ))}
      </div>
    </Container>
  );
}
```

Then wire it in `event-page.tsx` next to a similar section, and add the feature gate at that wire-up site:

```tsx
// event-page.tsx
{event.testimonials_toggle && testimonials.length ? (
  <Testimonials event={event} testimonials={testimonials} />
) : null}
```

If the data isn't yet in the payload, that's a `happily-api` skill problem — regenerate types, add a query, add a domain type alias.

## Client vs. server: earn your "use client"

Server components are the default in this repo. **Don't add `"use client"` reflexively** — most sections render fine on the server, fetch faster, and ship less JS.

You earn `"use client"` when you need *any* of:

- Form state (`useActionState`, `useState`) — e.g., `registration-form.tsx`
- Open/close state for a dialog or menu — e.g., `speaker-card.tsx`, `mobile-menu.tsx`
- `localStorage` or other browser-only APIs — e.g., `livestream-gate.tsx`
- Scroll behavior that needs `pathname` — e.g., `scroll-link.tsx`
- `useMemo` over derived maps used in interactive UI — e.g., `agenda-list.tsx`

The existing client components are: `header`, `navbar`, `mobile-menu`, `registration-form`, `agenda-list`, `speaker-card`, `livestream-gate`, `add-to-calendar`, `scroll-link`, `markdown`. Everything else is server — including the heavyweights like `hero-section`, `event-page`, `speakers-grid`, `sponsors-grid`, `faq-list`. If you're tempted to add `"use client"` to a server component, first check whether the interactive bit can be split into a small client child while the parent stays server.

## Working with the shadcn primitives

`components/ui/` contains the radix-vega-style primitives — `button`, `input`, `select`, `textarea`, `checkbox`, `accordion`, `tabs`, `dialog`, `avatar`, `badge`, `label`. Import from `@/components/ui/<name>`.

**Restyle via className composition, not by editing the primitive.** The primitives are intentionally unopinionated — they take a `className` you compose with CSS-var classes:

```tsx
import { Button } from "@/components/ui/button";

<Button className="bg-(--event-primary-bg) text-(--event-primary-text) rounded-(--event-border-radius)">
  Register
</Button>
```

If you find yourself needing variants the primitive doesn't expose, prefer a wrapper component over editing the primitive — keeps `components/ui/` upgrade-safe against shadcn updates.

## Gotchas

- **Nullable arrays.** `attendees-list.tsx` returns `null` when the array is empty (line 12-14). Mirror this — every section component should return `null` (or skip rendering at the parent) when there's nothing to show.
- **`heroImage()` covers both fields.** `content.heroImage` and `content.heroGraphic` are both nullable; `heroImage(content)` returns the first non-null. Don't check them separately.
- **`display_settings` flags default to true.** `event.display_settings.displayLocation ?? true` — undefined means "show it." Mirror this when adding new sub-feature flags. The toggle-style flags (`photos_toggle`, `live_toggle`) default to false and are explicit booleans — read them straight.
- **Registration form field names.** `registration-form.tsx:49-55` remaps `emailAddress` / `email_address` → `email`, `firstName` → `first_name`, etc. **Case-sensitive.** Don't change the input names without checking `app/actions/register.ts`. (Detailed in the `happily-api` skill.)
- **`getPublicAttendees` returns `null` instead of throwing** — and that asymmetry is load-bearing for the confirmation page. If you call queries from a new page, pick your error style deliberately. (See `happily-api` skill.)
- **`lib/happily/generated/` is read-only.** If a field doesn't exist on the typed payload, regenerate via `npm run api:types` — don't hand-edit and don't import from `generated/` directly. Import from `@/lib/happily/types`.
- **No explicit fetch caching.** Queries are bare `await` calls; pages re-render on each request. If you need revalidation, decide deliberately rather than copying defaults.
- **`<Container>` is `<section>`.** Repeating because it bites: `wrapperClassName` = outer section, `className` = inner `max-w-7xl` div. For a full-bleed colored band, put the `bg-*` on `wrapperClassName`.

## Anti-patterns

- ❌ Using `bg-[var(--event-primary-bg)]` — use `bg-(--event-primary-bg)` (Tailwind v4 native syntax).
- ❌ Burying a feature gate inside a section component. Gate at the composition layer.
- ❌ Adding `"use client"` to a component that only renders props. Lift the interactive child instead.
- ❌ Inventing a central `event.features` object. Gates come straight off the payload.
- ❌ Hand-rolling date formatting. Use `formatEventDate`, `eventDateRange`, `eventTimeRange` — they're timezone-aware.
- ❌ Re-implementing `value?.trim() || fallback`. That's `text()`.
- ❌ Editing `components/ui/*` to add event-specific styling. Wrap or compose className instead.
- ❌ Forking the data layer per event. `lib/happily/` stays the same across forks; only `components/` is meant to be redesigned.

## What's out of scope

- **Data-layer changes** (queries, types, the registration server action) — that's the `happily-api` skill.
- **Adding new payload fields** upstream — coordinate with the Happily API team, then `npm run api:types`.
- **Routing, metadata, env vars** — see CLAUDE.md and the `happily-api` skill.
