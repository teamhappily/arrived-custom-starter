import Image from "next/image";

import { AddToCalendar } from "@/components/add-to-calendar";
import { AttendeesList } from "@/components/attendees-list";
import { Container } from "@/components/container";
import { EventDetails } from "@/components/event-details";
import { text } from "@/components/helpers";
import { Markdown } from "@/components/markdown";
import type { CalendarEvent } from "@/lib/happily/calendar";
import { getEventId, resolveEventEnv } from "@/lib/happily/config";
import { getPublicAttendees, getPublicEvent } from "@/lib/happily/queries";

export default async function ConfirmationPage() {
  const eventId = getEventId();
  const env = await resolveEventEnv();
  const eventData = await getPublicEvent({ eventId, env });
  const attendees =
    eventData.event.content.displayAttendeesList === true
      ? await getPublicAttendees({
          eventId,
          env,
          pageSize: eventData.event.content.attendeesPageSize ?? 12,
        })
      : null;
  const { event } = eventData;
  const content = event.content;

  const calendarEvent: CalendarEvent | null =
    event.display_add_to_calendar && event.start_date && event.end_date
      ? {
          title: event.name,
          description: text(content.aboutDescription),
          startDate: event.start_date,
          endDate: event.end_date,
          timezone: event.timezone ?? "UTC",
          location: event.location ?? undefined,
        }
      : null;

  return (
    <main>
      <Container className="grid max-w-7xl gap-10 text-center">
        <section>
          {content.confirmationImage ? (
            <Image
              src={content.confirmationImage}
              alt=""
              width={800}
              height={600}
              className="mb-8 aspect-4/3 w-full rounded-(--event-border-radius) object-cover"
            />
          ) : null}
          <h1 className="text-5xl font-semibold">
            {text(content.confirmationTitle, "You're registered")}
          </h1>
          <EventDetails event={event} />
          {content.confirmationDescription ? (
            <Markdown className="mt-5 text-lg opacity-80">
              {content.confirmationDescription}
            </Markdown>
          ) : null}
          {calendarEvent ? (
            <AddToCalendar event={calendarEvent} className="mt-8" />
          ) : null}
        </section>

        {attendees?.attendees.length ? (
          <AttendeesList
            attendees={attendees.attendees}
            title={text(content.attendeesListTitle, "Who's attending")}
          />
        ) : null}
      </Container>
    </main>
  );
}
