import { ChangeEvent, DragEvent, useState } from "react";
import { AlertCircle, Brain, CheckCircle2, Database, Eye, FileUp, Play, RefreshCcw, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ValidationReport } from "../lib/validation";
import { IngestionResult } from "../lib/ingestion";
import { AiInsights } from "../lib/ai";
import { Input } from "./ui/input";

interface HeroPanelProps {
  csvInput: string;
  report: ValidationReport;
  ingestion: IngestionResult;
  aiInsights: AiInsights;
  filename: string;
  onCsvInputChange: (value: string) => void;
  onAnalyze: () => void;
  onPreview: () => void;
  onAcceptMapping: (sourceHeader: string, suggestedField: string) => void;
  onLoadSample: () => void;
  demoDatasets: string[];
  onLoadDemoDataset: (name: string) => void;
  onFilenameChange: (value: string) => void;
  onUploadCsv: (file: File) => void;
  demoPackFiles: string[];
  onDownloadDemoPack: (filename: string) => void;
  isIngesting: boolean;
  isValidating: boolean;
  validationMode: "api" | "local";
}

export function HeroPanel({
  csvInput,
  report,
  ingestion,
  aiInsights,
  filename,
  onCsvInputChange,
  onAnalyze,
  onPreview,
  onAcceptMapping,
  onLoadSample,
  demoDatasets,
  onLoadDemoDataset,
  onFilenameChange,
  onUploadCsv,
  demoPackFiles,
  onDownloadDemoPack,
  isIngesting,
  isValidating,
  validationMode,
}: HeroPanelProps) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  function importFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      return;
    }

    onUploadCsv(file);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    importFile(file);
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFile(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFile(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFile(false);
    importFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-2">Automation QA Dashboard</h1>
          <p className="text-muted-foreground">
            Detect missing columns, blank required fields, invalid formats, and duplicate rows before export.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" />
            AI Provider: {aiInsights.provider === "huggingface" ? "Hugging Face" : "Fallback"}
          </Badge>
          <Badge variant={report.issues.length === 0 ? "secondary" : "outline"} className="gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isValidating || isIngesting ? "bg-blue-500" : report.issues.length === 0 ? "bg-green-500" : "bg-orange-500"}`}></span>
            {isIngesting
              ? "Importing CSV"
              : isValidating
                ? "Validating"
                : report.issues.length === 0
                  ? `Ready To Export (${validationMode.toUpperCase()})`
                  : `${report.issues.length} Issues Found (${validationMode.toUpperCase()})`}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{report.totalRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Rows detected in the current CSV payload
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Clean Records</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{report.cleanRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-green-600">
                {report.totalRows === 0 ? "0.0" : ((report.cleanRows / report.totalRows) * 100).toFixed(1)}% pass rate
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Issues Detected</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{report.issues.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Dataset-level and row-level validation failures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">AI Suggestions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{(aiInsights.suggestedMappings.length + aiInsights.fuzzyDuplicates.length).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Smart mappings and fuzzy duplicate leads from the AI layer
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Validation Input</CardTitle>
            <CardDescription>Paste CSV content or upload a file. CSV uploads immediately run ingestion and validation through the backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-5 transition-colors ${
                isDraggingFile
                  ? "border-sky-500 bg-sky-50"
                  : "border-border bg-muted/10"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <FileUp className={`h-6 w-6 ${isDraggingFile ? "text-sky-600" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-foreground">
                  Drag and drop a CSV file here
                </p>
                <p className="text-xs text-muted-foreground">
                  Or use the upload button below to import and detect errors immediately
                </p>
              </div>
            </div>
            <Textarea
              value={csvInput}
              onChange={(event) => onCsvInputChange(event.target.value)}
              className="min-h-[280px] font-mono text-sm"
              placeholder="id,name,email,phone"
            />
            <Input
              value={filename}
              onChange={(event) => onFilenameChange(event.target.value)}
              placeholder="upload.csv"
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={onPreview} variant="secondary" className="gap-2" disabled={isIngesting}>
                <Eye className="h-4 w-4" />
                {isIngesting ? "Previewing" : "Preview Intake"}
              </Button>
              <Button onClick={onAnalyze} className="gap-2" disabled={isValidating}>
                <Play className="h-4 w-4" />
                {isValidating ? "Running" : "Run Validation"}
              </Button>
              <Button variant="outline" onClick={onLoadSample} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Load Sample
              </Button>
              <Button variant="outline" asChild className="gap-2" disabled={isIngesting || isValidating}>
                <label>
                  <FileUp className="h-4 w-4" />
                  {isIngesting || isValidating ? "Processing Upload" : "Upload CSV"}
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {demoDatasets.map((dataset) => (
                <Button
                  key={dataset}
                  variant="secondary"
                  size="sm"
                  onClick={() => onLoadDemoDataset(dataset)}
                >
                  {dataset}
                </Button>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Backend Ingestion Preview</p>
                  <Badge variant="outline">{ingestion.rowCount} rows</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ingestion.headers.map((header) => (
                    <Badge key={header} variant="secondary">{header}</Badge>
                  ))}
                </div>
                {ingestion.missingColumns.length > 0 && (
                  <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
                    <div className="flex items-center gap-2 font-medium">
                      <TriangleAlert className="h-4 w-4" />
                      Missing required columns
                    </div>
                    <p className="mt-1">{ingestion.missingColumns.join(", ")}</p>
                  </div>
                )}
                {aiInsights.suggestedMappings.length > 0 && (
                  <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
                    <div className="flex items-center gap-2 font-medium">
                      <Brain className="h-4 w-4" />
                      AI column mapping suggestions
                    </div>
                    <div className="mt-2 space-y-2">
                      {aiInsights.suggestedMappings.map((mapping) => (
                        <div key={`${mapping.sourceHeader}-${mapping.suggestedField}`} className="flex items-start justify-between gap-3">
                          <div>
                            <p>
                              <span className="font-medium">{mapping.sourceHeader}</span> {"->"} <span className="font-medium">{mapping.suggestedField}</span> ({Math.round(mapping.confidence * 100)}%)
                            </p>
                            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-sky-700">
                              Why this suggestion appeared
                            </p>
                            <p className="mt-0.5 text-xs text-sky-800">{mapping.reason}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAcceptMapping(mapping.sourceHeader, mapping.suggestedField)}
                          >
                            Accept
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">Preview Rows</p>
                <div className="mt-3 space-y-3 text-sm">
                  {ingestion.previewRows.length === 0 && (
                    <p className="text-muted-foreground">No preview rows available yet.</p>
                  )}
                  {ingestion.previewRows.map((row) => (
                    <div key={row.rowNumber} className="rounded-md border bg-background p-3">
                      <p className="mb-2 font-medium text-foreground">Row {row.rowNumber}</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {Object.entries(row.values).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">{key}</p>
                            <p className="truncate text-foreground">{value || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Test CSV Pack</CardTitle>
            <CardDescription>Download presentation-ready bad CSV files with focused failure cases.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium text-foreground">Included files</p>
              <div className="mt-3 flex flex-col gap-2">
                {demoPackFiles.map((file) => (
                  <Button
                    key={file}
                    variant="outline"
                    className="justify-start"
                    onClick={() => onDownloadDemoPack(file)}
                  >
                    {file}
                  </Button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium text-foreground">Best live-demo flow</p>
              <p className="mt-2">Download one file, drag it into the drop zone, show ingestion preview, then show validation and AI suggestions updating automatically.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
