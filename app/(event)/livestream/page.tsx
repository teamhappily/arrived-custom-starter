import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { EventDetails } from "@/components/event-details";
import { LivestreamGate } from "@/components/livestream-gate";
import { getEventId, resolveEventEnv } from "@/lib/happily/config";
import { getPublicEvent } from "@/lib/happily/queries";

export default async function LivestreamPage() {
  const eventId = getEventId();
  const env = await resolveEventEnv();
  const eventData = await getPublicEvent({ eventId, env });
  const livestream = eventData.livestream;

  if (!eventData.event.live_toggle || !livestream?.enabled) {
    notFound();
  }

  return (
    <LivestreamGate
      eventId={eventId}
      env={env}
      form={livestream.form ?? null}
      formActive={!!livestream.form?.is_active}
    >
      <main>
        <Container className="grid max-w-7xl gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">
              Livestream
            </p>
            <h1 className="mt-3 text-5xl font-semibold">
              {eventData.event.name}
            </h1>
            <EventDetails event={eventData.event} />
          </div>

          {livestream.stream_url ? (
            <div className="aspect-video overflow-hidden bg-black">
              <iframe
                src={livestream.stream_url}
                title={`${eventData.event.name} livestream`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            </div>
          ) : (
            <p>The livestream URL has not been published yet.</p>
          )}

          {livestream.chat_url ? (
            <a
              href={livestream.chat_url}
              className="font-semibold underline"
              target="_blank"
              rel="noreferrer"
            >
              Open chat
            </a>
          ) : null}
        </Container>
      </main>
    </LivestreamGate>
  );
}
