// Kit chrome, not part of the event design: rendered only for preview
// requests (see proxy.ts), so it deliberately ignores the --event-*
// theme variables. Exiting preview must be a full document navigation,
// not a client-side one: this banner (and the theme/metadata) live in
// the layout, which App Router preserves across soft navigations — a
// <Link> would swap the page back to published data while the layout
// kept showing the preview banner. A plain <a> also never prefetches,
// so the proxy's cookie-clearing response only fires on a real click.
export function PreviewBanner() {
  return (
    <div className="flex items-center justify-center gap-3 bg-neutral-900 px-4 py-2 text-center text-sm text-white">
      <p>Previewing draft content — changes here are not published yet.</p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/?preview=false"
        className="shrink-0 font-semibold underline underline-offset-2"
      >
        Exit preview
      </a>
    </div>
  );
}
