import { EventPage } from "@/components/event-page";
import { getEventId, resolveEventEnv } from "@/lib/happily/config";
import { getPublicEvent } from "@/lib/happily/queries";

export default async function Home() {
  const eventId = getEventId();
  const env = await resolveEventEnv();
  const eventData = await getPublicEvent({ eventId, env });

  return <EventPage eventData={eventData} eventId={eventId} env={env} />;
}
