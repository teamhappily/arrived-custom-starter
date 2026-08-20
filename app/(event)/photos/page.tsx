import Image from "next/image";
import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { getEventId, resolveEventEnv } from "@/lib/happily/config";
import { getPublicEvent, getPublicPhotos } from "@/lib/happily/queries";

export default async function PhotosPage() {
  const eventId = getEventId();
  const env = await resolveEventEnv();
  const eventData = await getPublicEvent({ eventId, env });

  if (!eventData.event.photos_toggle || !eventData.photo_gallery?.enabled) {
    notFound();
  }

  const gallery = await getPublicPhotos({ eventId, env, pageSize: 60 });

  return (
    <main>
      <Container>
        <p className="text-sm font-semibold uppercase tracking-[0.18em]">
          Gallery
        </p>
        <h1 className="mt-3 text-5xl font-semibold">
          {eventData.event.name} Photos
        </h1>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.photos.map((photo) =>
            photo.media ? (
              <Image
                key={photo.id}
                src={photo.media.path ?? photo.media.fallback_path}
                alt={photo.media.description ?? ""}
                width={600}
                height={450}
                className="aspect-4/3 w-full object-cover"
              />
            ) : null,
          )}
        </div>
      </Container>
    </main>
  );
}
