import { REQUIRED_COLUMNS } from "../../shared/contracts.mjs";
import { getAiColumnMappings } from "../ai/ai-enrichment-service.mjs";
import { ingestCsv as ingestCsvHeuristic } from "./csv-ingestion-service.mjs";

export async function ingestCsv(csv, options = {}) {
  const ingestion = ingestCsvHeuristic(csv, options);
  const unmappedHeaders = (ingestion.rawHeaders ?? []).filter((_, index) => {
    const normalizedHeader = ingestion.headers[index];
    return !REQUIRED_COLUMNS.includes(normalizedHeader);
  });
  const aiMappings = await getAiColumnMappings(unmappedHeaders, ingestion.missingColumns ?? REQUIRED_COLUMNS);

  return {
    ...ingestion,
    aiProvider: aiMappings ? "huggingface" : "fallback",
    suggestedMappings: (aiMappings ?? ingestion.suggestedMappings).filter(
      (mapping) => ingestion.mappingOverrides?.[mapping.sourceHeader] !== mapping.suggestedField,
    ),
  };
}
