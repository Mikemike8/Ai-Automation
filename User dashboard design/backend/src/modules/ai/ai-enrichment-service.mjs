import { requestHuggingFaceJson, isHuggingFaceEnabled } from "./huggingface-client.mjs";

function clampConfidence(value, fallback = 0.7) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return fallback;
  }

  return Math.max(0, Math.min(1, Number(numeric.toFixed(2))));
}

export async function getAiColumnMappings(rawHeaders, requiredColumns) {
  if (!isHuggingFaceEnabled() || rawHeaders.length === 0 || requiredColumns.length === 0) {
    return null;
  }

  const allowedHeaders = new Set(rawHeaders);
  const allowedFields = new Set(requiredColumns);
  const prompt = [
    "Map raw CSV headers to the expected business schema fields when there is a strong semantic match.",
    `Raw headers: ${JSON.stringify(rawHeaders)}`,
    `Expected fields: ${JSON.stringify(requiredColumns)}`,
    "Only return suggestions when confidence is at least 0.55.",
  ].join("\n");

  const schema = {
    name: "column_mapping_suggestions",
    example: {
      suggestions: [
        {
          sourceHeader: "string",
          suggestedField: "string",
          confidence: 0.88,
          reason: "string",
        },
      ],
    },
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        suggestions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              sourceHeader: { type: "string" },
              suggestedField: { type: "string" },
              confidence: { type: "number" },
              reason: { type: "string" },
            },
            required: ["sourceHeader", "suggestedField", "confidence", "reason"],
          },
        },
      },
      required: ["suggestions"],
    },
  };

  try {
    const result = await requestHuggingFaceJson(prompt, schema);
    const suggestions = Array.isArray(result?.suggestions) ? result.suggestions : [];
    return suggestions
      .filter((item) => allowedHeaders.has(String(item?.sourceHeader)) && allowedFields.has(String(item?.suggestedField)))
      .map((item) => ({
        sourceHeader: String(item.sourceHeader),
        suggestedField: String(item.suggestedField),
        confidence: clampConfidence(item.confidence, 0.75),
        reason: String(item.reason || "Semantic schema match from Hugging Face"),
      }));
  } catch (error) {
    console.warn("Hugging Face column mapping failed:", error);
    return null;
  }
}

export async function getAiFuzzyDuplicates(rows) {
  if (!isHuggingFaceEnabled() || rows.length < 2) {
    return null;
  }

  const promptRows = rows.slice(0, 12).map((row) => ({
    rowNumber: row.rowNumber,
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
  }));

  const prompt = [
    "Find likely near-duplicate records in this dataset.",
    "Ignore exact duplicates that a rules engine would already catch.",
    `Rows: ${JSON.stringify(promptRows)}`,
    "Return only likely duplicate pairs with confidence >= 0.7.",
  ].join("\n");

  const schema = {
    name: "fuzzy_duplicate_suggestions",
    example: {
      duplicates: [
        {
          leftRecordId: "E-1",
          rightRecordId: "E-2",
          leftRowNumber: 2,
          rightRowNumber: 3,
          confidence: 0.84,
          reason: "string",
        },
      ],
    },
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        duplicates: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              leftRecordId: { type: "string" },
              rightRecordId: { type: "string" },
              leftRowNumber: { type: "number" },
              rightRowNumber: { type: "number" },
              confidence: { type: "number" },
              reason: { type: "string" },
            },
            required: ["leftRecordId", "rightRecordId", "leftRowNumber", "rightRowNumber", "confidence", "reason"],
          },
        },
      },
      required: ["duplicates"],
    },
  };

  try {
    const result = await requestHuggingFaceJson(prompt, schema);
    const duplicates = Array.isArray(result?.duplicates) ? result.duplicates : [];
    return duplicates
      .filter((item) => item?.leftRecordId && item?.rightRecordId)
      .map((item) => ({
        leftRecordId: String(item.leftRecordId),
        rightRecordId: String(item.rightRecordId),
        leftRowNumber: Number(item.leftRowNumber),
        rightRowNumber: Number(item.rightRowNumber),
        confidence: clampConfidence(item.confidence, 0.76),
        reason: String(item.reason || "Likely near-duplicate based on semantic similarity"),
      }))
      .filter((item) => Number.isFinite(item.leftRowNumber) && Number.isFinite(item.rightRowNumber));
  } catch (error) {
    console.warn("Hugging Face fuzzy duplicate detection failed:", error);
    return null;
  }
}
