import { notFound } from "next/navigation";

import { happilyClient } from "./client";
import { getEventId, resolveEventEnv } from "./config";
import type {
  HappilyEnv,
  PublicAttendeesData,
  PublicEventData,
  PublicPhotoData,
} from "./types";

type PublicQueryOptions = {
  eventId?: string;
  env?: HappilyEnv;
};

// The API answers "EVENT_NOT_FOUND" (e.g. an unpublished event fetched
// with env=prod); "NOT_FOUND" is kept for backward compatibility.
const NOT_FOUND_CODES = ["NOT_FOUND", "EVENT_NOT_FOUND"];

export async function getPublicEvent({
  eventId = getEventId(),
  env,
}: PublicQueryOptions = {}): Promise<PublicEventData> {
  const { data, error } = await happilyClient.GET("/api/public/{eventId}", {
    params: {
      path: { eventId },
      query: { env: env ?? (await resolveEventEnv()) },
    },
  });

  if (error) {
    if ("code" in error && error.code && NOT_FOUND_CODES.includes(error.code)) {
      notFound();
    }

    throw new Error(error.error);
  }

  if (!data) {
    notFound();
  }

  return data as PublicEventData;
}

export async function getPublicPhotos({
  eventId = getEventId(),
  env,
  page = 1,
  pageSize = 48,
}: PublicQueryOptions & {
  page?: number;
  pageSize?: number;
} = {}): Promise<PublicPhotoData> {
  const { data, error } = await happilyClient.GET(
    "/api/public/{eventId}/photos",
    {
      params: {
        path: { eventId },
        query: { env: env ?? (await resolveEventEnv()), page, page_size: pageSize },
      },
    },
  );

  if (error) {
    throw new Error(error.error);
  }

  if (!data) {
    notFound();
  }

  return data as PublicPhotoData;
}

export async function getPublicAttendees({
  eventId = getEventId(),
  env,
  page = 1,
  pageSize = 12,
}: PublicQueryOptions & {
  page?: number;
  pageSize?: number;
} = {}): Promise<PublicAttendeesData | null> {
  const { data, error } = await happilyClient.GET(
    "/api/public/{eventId}/attendees",
    {
      params: {
        path: { eventId },
        query: { env: env ?? (await resolveEventEnv()), page, page_size: pageSize },
      },
    },
  );

  if (error) {
    return null;
  }

  return (data as PublicAttendeesData | undefined) ?? null;
}
