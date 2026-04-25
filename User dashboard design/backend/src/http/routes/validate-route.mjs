import { analyzeCsv } from "../../../../src/app/lib/validation-core.js";
import { detectFuzzyDuplicates } from "../../modules/ai/fuzzy-dedupe-service.mjs";
import { ingestCsv } from "../../modules/ingestion/ingestion-service.mjs";

export async function handleValidateRoute(csv, mappingOverrides) {
  const ingestion = await ingestCsv(csv, { mappingOverrides });
  const report = analyzeCsv(ingestion.normalized);
  const ai = {
    provider: ingestion.aiProvider === "huggingface" ? "huggingface" : "fallback",
    suggestedMappings: ingestion.suggestedMappings,
    fuzzyDuplicates: detectFuzzyDuplicates(report.rows),
  };

  return {
    ingestion,
    report,
    ai,
  };
}
