import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import openapiTS, { astToString } from "openapi-typescript";

const DEFAULT_API_BASE_URL = "https://app.happily.events";
const SCHEMA_PATH = "/api/openapi.json";
const OUTPUT_PATH = "lib/happily/generated/schema.d.ts";

async function loadEnvLocal() {
  let content;

  try {
    content = await readFile(".env.local", "utf8");
  } catch {
    return;
  }

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    process.env[key] ??= valueParts.join("=").replace(/^['"]|['"]$/g, "");
  }
}

async function fetchSchema(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI schema: ${response.status}`);
  }

  return response.json();
}

await loadEnvLocal();

// HAPPILY_API_SCHEMA_URL is an explicit override; otherwise the schema URL
// is derived from the API base URL (which itself defaults to production).
const schemaUrl =
  process.env.HAPPILY_API_SCHEMA_URL ||
  `${process.env.HAPPILY_API_BASE_URL || DEFAULT_API_BASE_URL}${SCHEMA_PATH}`;
const schema = await fetchSchema(schemaUrl);

// The current public schema emits internal JSON Schema refs to #/definitions.
// Alias definitions locally so openapi-typescript can resolve those refs.
schema.definitions ??= schema.components?.schemas ?? {};

const ast = await openapiTS(schema);
const output = astToString(ast);

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, output);

console.log(`Generated ${OUTPUT_PATH} from ${schemaUrl}`);
