import createClient from "openapi-fetch";

import { getApiBaseUrl } from "./config";
import type { paths } from "./generated/schema";

/** @deprecated Use getApiBaseUrl() from "./config" instead. */
export const HAPPILY_API_BASE_URL = getApiBaseUrl();

export const happilyClient = createClient<paths>({
  baseUrl: getApiBaseUrl(),
});
