import { NextResponse, type NextRequest } from "next/server";

import {
  PREVIEW_COOKIE,
  PREVIEW_HEADER,
  PREVIEW_QUERY_PARAM,
} from "@/lib/happily/preview";

// Skip Next.js internals and any file request (paths with an extension).
export const config = {
  matcher: ["/((?!_next/|.*\\..*).*)"],
};

export function proxy(request: NextRequest) {
  const param = request.nextUrl.searchParams.get(PREVIEW_QUERY_PARAM);
  const hasCookie = request.cookies.get(PREVIEW_COOKIE)?.value === "1";

  // ?preview=true enables preview, ?preview=false disables it, and an
  // existing session cookie keeps it active across internal navigation.
  const preview = param === "true" || (hasCookie && param !== "false");

  const requestHeaders = new Headers(request.headers);
  // Never trust a preview header sent by the client.
  requestHeaders.delete(PREVIEW_HEADER);
  if (preview) {
    requestHeaders.set(PREVIEW_HEADER, "1");
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (param === "true" && !hasCookie) {
    // Session cookie (no maxAge): preview ends when the browser closes.
    response.cookies.set(PREVIEW_COOKIE, "1", {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
  } else if (param === "false" && hasCookie) {
    response.cookies.delete(PREVIEW_COOKIE);
  }

  return response;
}
