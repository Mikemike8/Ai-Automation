import { ingestCsv } from "../../modules/ingestion/ingestion-service.mjs";

export async function handleIngestRoute(body) {
  return {
    ingestion: await ingestCsv(body?.csv, {
      filename: body?.filename,
      mappingOverrides: body?.mappingOverrides,
    }),
  };
}
