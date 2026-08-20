// Shared between proxy.ts and server code. Keep this module free of
// runtime imports so the proxy can bundle it safely.

// Internal request header set by the proxy. Server code must read this
// header (via resolveEventEnv) instead of parsing the URL or cookies.
export const PREVIEW_HEADER = "x-happily-preview";

// Session cookie that keeps preview active across internal navigation.
export const PREVIEW_COOKIE = "happily-preview";

// Query param the CMS "Preview changes" button appends to page URLs.
export const PREVIEW_QUERY_PARAM = "preview";
