export interface IngestionPreviewRow {
  rowNumber: number;
  values: Record<string, string>;
}

export interface SuggestedColumnMapping {
  sourceHeader: string;
  suggestedField: string;
  confidence: number;
  reason: string;
}

export interface IngestionResult {
  filename: string;
  rowCount: number;
  rawHeaders?: string[];
  headers: string[];
  missingColumns: string[];
  mappingOverrides?: Record<string, string>;
  aiProvider?: "huggingface" | "fallback";
  suggestedMappings: SuggestedColumnMapping[];
  previewRows: IngestionPreviewRow[];
  normalized: string;
}
