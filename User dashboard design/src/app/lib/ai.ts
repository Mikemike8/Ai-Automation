import { SuggestedColumnMapping } from "./ingestion";

export interface FuzzyDuplicateSuggestion {
  leftRecordId: string;
  rightRecordId: string;
  leftRowNumber: number;
  rightRowNumber: number;
  confidence: number;
  reason: string;
}

export interface AiInsights {
  provider: "huggingface" | "fallback";
  suggestedMappings: SuggestedColumnMapping[];
  fuzzyDuplicates: FuzzyDuplicateSuggestion[];
}
