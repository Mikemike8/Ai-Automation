import { analyzeCsv, ValidationReport } from "./validation";
import { IngestionResult } from "./ingestion";
import { AiInsights } from "./ai";

export interface IngestionApiResult {
  mode: "api" | "local";
  ingestion: IngestionResult;
}

export interface ValidationApiResult {
  mode: "api" | "local";
  ingestion: IngestionResult;
  ai: AiInsights;
  report: ValidationReport;
}

function fallbackIngestion(csv: string, filename?: string, mappingOverrides?: Record<string, string>): IngestionResult {
  const report = analyzeCsv(csv);
  return {
    filename: filename || "upload.csv",
    rowCount: report.totalRows,
    rawHeaders: report.headers,
    headers: report.headers,
    missingColumns: report.missingColumns,
    mappingOverrides: mappingOverrides ?? {},
    aiProvider: "fallback",
    suggestedMappings: [],
    previewRows: report.rows.slice(0, 5).map((row) => ({
      rowNumber: row.rowNumber,
      values: row.values,
    })),
    normalized: csv,
  };
}

export async function ingestCsvWithApi(csv: string, filename?: string, mappingOverrides?: Record<string, string>): Promise<IngestionApiResult> {
  try {
    const response = await fetch("/api/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ csv, filename, mappingOverrides }),
    });

    if (!response.ok) {
      throw new Error(`Ingestion request failed with status ${response.status}`);
    }

    const payload = await response.json();
    return {
      mode: "api",
      ingestion: payload.ingestion as IngestionResult,
    };
  } catch (error) {
    console.warn("Falling back to local ingestion:", error);
    return {
      mode: "local",
      ingestion: fallbackIngestion(csv, filename, mappingOverrides),
    };
  }
}

function emptyAiInsights(): AiInsights {
  return {
    provider: "fallback",
    suggestedMappings: [],
    fuzzyDuplicates: [],
  };
}

export async function validateCsvWithApi(csv: string, mappingOverrides?: Record<string, string>): Promise<ValidationApiResult> {
  try {
    const response = await fetch("/api/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ csv, mappingOverrides }),
    });

    if (!response.ok) {
      throw new Error(`Validation request failed with status ${response.status}`);
    }

    const payload = await response.json();
    return {
      mode: "api",
      ingestion: payload.ingestion as IngestionResult,
      ai: (payload.ai as AiInsights | undefined) ?? {
        provider: "fallback",
        suggestedMappings: (payload.ingestion?.suggestedMappings as AiInsights["suggestedMappings"]) ?? [],
        fuzzyDuplicates: [],
      },
      report: payload.report as ValidationReport,
    };
  } catch (error) {
    console.warn("Falling back to in-browser validation:", error);
    return {
      mode: "local",
      ingestion: fallbackIngestion(csv, "upload.csv", mappingOverrides),
      ai: emptyAiInsights(),
      report: analyzeCsv(csv),
    };
  }
}
