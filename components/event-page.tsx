import type { HappilyEnv, PublicEventData } from "@/lib/happily/types";

import { AgendaList } from "./agenda-list";
import { Container } from "./container";
import { ContentSection } from "./content-section";
import { FaqList } from "./faq-list";
import { hasText, text } from "./helpers";
import { HeroSection } from "./hero-section";
import { Markdown } from "./markdown";
import { RegistrationForm } from "./registration-form";
import { SectionHeading } from "./section-heading";
import { SpeakersGrid } from "./speakers-grid";
import { SponsorsGrid } from "./sponsors-grid";

type EventPageProps = {
  eventData: PublicEventData;
  eventId: string;
  env: HappilyEnv;
};

export function EventPage({ eventData, eventId, env }: EventPageProps) {
  const { event, form, sessions, speakers, sponsors, faqs, tracks } = eventData;
  const content = event.content;

  return (
    <main>
      <HeroSection event={event} formActive={form?.is_active} />

      {hasText(content.aboutTitle) || hasText(content.aboutDescription) ? (
        <ContentSection
          id="about"
          title={text(content.aboutTitle, "About")}
          description={content.aboutDescription}
          image={content.aboutImage}
        />
      ) : null}

      {sessions.length ? (
        <Container id="agenda">
          <SectionHeading
            title={text(content.agendaTitle, "Agenda")}
            description={content.agendaDescription}
          />
          <div className="mt-8">
            <AgendaList
              sessions={sessions}
              speakers={speakers}
              tracks={tracks}
              event={event}
            />
          </div>
        </Container>
      ) : null}

      {speakers.length ? (
        <Container id="speakers">
          <SectionHeading
            title={text(content.speakersTitle, "Speakers")}
            description={content.speakersDescription}
          />
          <div className="mt-8">
            <SpeakersGrid speakers={speakers} />
          </div>
        </Container>
      ) : null}

      {form ? (
        <Container
          id="register"
          className="flex max-w-7xl flex-col items-center text-center"
          wrapperClassName="bg-(--event-accent-bg) text-(--event-accent-text)"
        >
          {form.form_title ? (
            <h2 className="text-4xl font-semibold">
              {text(form.form_title, "Register")}
            </h2>
          ) : null}
          {form.form_description ? (
            <Markdown className="mt-3 text-base opacity-80 md:text-lg">
              {form.form_description}
            </Markdown>
          ) : null}
          <div className="mt-10 flex w-full items-center justify-center">
            <RegistrationForm
              eventId={eventId}
              env={env}
              form={form}
              redirectTo="/confirmation"
              buttonText={form.form_button_text}
            />
          </div>
        </Container>
      ) : null}

      {hasText(content.companyAboutTitle) ||
      hasText(content.companyAboutDescription) ? (
        <ContentSection
          id="host"
          title={text(content.companyAboutTitle, "About the Host")}
          description={content.companyAboutDescription}
          image={content.companyAboutImage}
        />
      ) : null}

      {sponsors.length ? (
        <Container id="sponsors">
          <SectionHeading
            title={text(content.sponsorsTitle, "Sponsors")}
            description={content.sponsorsDescription}
          />
          <div className="mt-8">
            <SponsorsGrid sponsors={sponsors} />
          </div>
        </Container>
      ) : null}

      {faqs.length ? (
        <Container id="faqs">
          <SectionHeading
            title={text(content.faqsTitle, "FAQs")}
            description={content.faqsDescription}
          />
          <div className="mt-8">
            <FaqList faqs={faqs} />
          </div>
        </Container>
      ) : null}
    </main>
  );
}
