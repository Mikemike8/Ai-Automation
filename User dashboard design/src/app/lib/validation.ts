import {
  analyzeCsv as analyzeCsvCore,
  DEMO_DATASETS,
  SAMPLE_CSV,
} from "./validation-core";

export type IssueType =
  | "missing_column"
  | "missing_value"
  | "duplicate"
  | "invalid_email"
  | "invalid_phone";

export interface ValidationIssue {
  id: string;
  type: IssueType;
  severity: "low" | "medium" | "high";
  rowNumber: number | null;
  recordId: string;
  field: string;
  message: string;
  suggestion: string;
}

export interface ParsedRow {
  rowNumber: number;
  id: string;
  name: string;
  email: string;
  phone: string;
  values: Record<string, string>;
  issues: ValidationIssue[];
}

export interface ValidationReport {
  headers: string[];
  rows: ParsedRow[];
  issues: ValidationIssue[];
  totalRows: number;
  cleanRows: number;
  duplicateRows: number;
  missingColumns: string[];
}

export const analyzeCsv = (input: string): ValidationReport =>
  analyzeCsvCore(input) as ValidationReport;

export { DEMO_DATASETS, SAMPLE_CSV };
