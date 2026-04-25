import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { HeroPanel } from "./components/HeroPanel";
import { SummaryCards } from "./components/SummaryCards";
import { DataTable } from "./components/DataTable";
import { AiSuggestionsPanel } from "./components/AiSuggestionsPanel";
import { analyzeCsv, DEMO_DATASETS, SAMPLE_CSV } from "./lib/validation";
import { ingestCsvWithApi, validateCsvWithApi } from "./lib/api";
import { IngestionResult } from "./lib/ingestion";
import { AiInsights } from "./lib/ai";
import { BAD_TEST_CSV_PACK, downloadCsv } from "./lib/demo-pack";

export default function App() {
  const [csvInput, setCsvInput] = useState(SAMPLE_CSV);
  const [report, setReport] = useState(() => analyzeCsv(SAMPLE_CSV));
  const [ingestion, setIngestion] = useState<IngestionResult>({
    filename: "upload.csv",
    rowCount: report.totalRows,
    rawHeaders: report.headers,
    headers: report.headers,
    missingColumns: report.missingColumns,
    suggestedMappings: [],
    previewRows: report.rows.slice(0, 5).map((row) => ({
      rowNumber: row.rowNumber,
      values: row.values,
    })),
    normalized: SAMPLE_CSV,
  });
  const [aiInsights, setAiInsights] = useState<AiInsights>({
    provider: "fallback",
    suggestedMappings: [],
    fuzzyDuplicates: [],
  });
  const [isValidating, setIsValidating] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [validationMode, setValidationMode] = useState<"api" | "local">("local");
  const [selectedFilename, setSelectedFilename] = useState("sample.csv");
  const [acceptedMappings, setAcceptedMappings] = useState<Record<string, string>>({});

  async function importCsvFile(file: File) {
    const contents = await file.text();
    setCsvInput(contents);
    setSelectedFilename(file.name);
    setAcceptedMappings({});
    await runIngestion(contents, file.name, {});
    await runValidation(contents, {});
  }

  async function runIngestion(nextCsv: string, filename?: string, mappingOverrides?: Record<string, string>) {
    setIsIngesting(true);
    const result = await ingestCsvWithApi(nextCsv, filename, mappingOverrides);
    setIngestion(result.ingestion);
    if (!isValidating) {
      setValidationMode(result.mode);
    }
    setIsIngesting(false);
  }

  async function runValidation(nextCsv: string, mappingOverrides?: Record<string, string>) {
    setIsValidating(true);
    const result = await validateCsvWithApi(nextCsv, mappingOverrides);
    setIngestion(result.ingestion);
    setAiInsights(result.ai);
    setReport(result.report);
    setValidationMode(result.mode);
    setIsValidating(false);
  }

  useEffect(() => {
    void runIngestion(SAMPLE_CSV, "sample.csv", {});
    void runValidation(SAMPLE_CSV, {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <HeroPanel
            csvInput={csvInput}
            report={report}
            ingestion={ingestion}
            aiInsights={aiInsights}
            filename={selectedFilename}
            onCsvInputChange={setCsvInput}
            onAnalyze={() => void runValidation(csvInput, acceptedMappings)}
            onLoadSample={() => {
              setCsvInput(SAMPLE_CSV);
              setSelectedFilename("sample.csv");
              setAcceptedMappings({});
              void runIngestion(SAMPLE_CSV, "sample.csv", {});
              void runValidation(SAMPLE_CSV, {});
            }}
            demoDatasets={Object.keys(DEMO_DATASETS)}
            onLoadDemoDataset={(name) => {
              const dataset = DEMO_DATASETS[name as keyof typeof DEMO_DATASETS];
              setCsvInput(dataset);
              setSelectedFilename(`${name.toLowerCase().replace(/\s+/g, "-")}.csv`);
              setAcceptedMappings({});
              void runIngestion(dataset, `${name.toLowerCase().replace(/\s+/g, "-")}.csv`, {});
              void runValidation(dataset, {});
            }}
            onPreview={() => void runIngestion(csvInput, selectedFilename, acceptedMappings)}
            onAcceptMapping={(sourceHeader, suggestedField) => {
              const nextMappings = {
                ...acceptedMappings,
                [sourceHeader]: suggestedField,
              };
              setAcceptedMappings(nextMappings);
              void runIngestion(csvInput, selectedFilename, nextMappings);
              void runValidation(csvInput, nextMappings);
            }}
            onFilenameChange={setSelectedFilename}
            onUploadCsv={(file) => void importCsvFile(file)}
            onDownloadDemoPack={(filename) => {
              const contents = BAD_TEST_CSV_PACK[filename as keyof typeof BAD_TEST_CSV_PACK];
              if (contents) {
                downloadCsv(filename, contents);
              }
            }}
            demoPackFiles={Object.keys(BAD_TEST_CSV_PACK)}
            isIngesting={isIngesting}
            isValidating={isValidating}
            validationMode={validationMode}
          />
          <SummaryCards report={report} aiInsights={aiInsights} />
          <AiSuggestionsPanel
            aiInsights={aiInsights}
            acceptedMappings={acceptedMappings}
            onAcceptMapping={(sourceHeader, suggestedField) => {
              const nextMappings = {
                ...acceptedMappings,
                [sourceHeader]: suggestedField,
              };
              setAcceptedMappings(nextMappings);
              void runIngestion(csvInput, selectedFilename, nextMappings);
              void runValidation(csvInput, nextMappings);
            }}
          />
          <DataTable report={report} aiInsights={aiInsights} />
        </div>
      </main>
    </div>
  );
}
