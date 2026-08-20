import { headers } from "next/headers";

import { PREVIEW_HEADER } from "./preview";
import type { HappilyEnv } from "./types";

const DEFAULT_API_BASE_URL = "https://app.happily.events";

export function getEventId() {
  const eventId = process.env.HAPPILY_EVENT_ID;

  if (!eventId) {
    throw new Error("Missing HAPPILY_EVENT_ID in .env.local");
  }

  return eventId;
}

// HAPPILY_API_BASE_URL is an optional override for development
// (e.g. pointing at a locally running CMS).
export function getApiBaseUrl() {
  return process.env.HAPPILY_API_BASE_URL || DEFAULT_API_BASE_URL;
}

// Defaults to "prod" (the published event). Set HAPPILY_EVENT_ENV=staging
// to always fetch draft data, or use ?preview=true on any page.
export function getEventEnv(): HappilyEnv {
  const env = process.env.HAPPILY_EVENT_ENV;

  if (env === "prod" || env === "staging") {
    return env;
  }

  return "prod";
}

// Request-scoped env resolution: the proxy sets PREVIEW_HEADER when the
// request carries ?preview=true (or the preview session cookie). Reading
// headers() opts the route into dynamic rendering, which matches how this
// kit already works (fresh data on every request).
export async function resolveEventEnv(): Promise<HappilyEnv> {
  const requestHeaders = await headers();

  if (requestHeaders.get(PREVIEW_HEADER) === "1") {
    return "staging";
  }

  return getEventEnv();
}
