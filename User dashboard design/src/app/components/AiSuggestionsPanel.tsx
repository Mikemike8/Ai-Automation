import { Brain, CheckCircle2, GitMerge, Sparkles } from "lucide-react";
import { AiInsights } from "../lib/ai";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface AiSuggestionsPanelProps {
  aiInsights: AiInsights;
  acceptedMappings: Record<string, string>;
  onAcceptMapping: (sourceHeader: string, suggestedField: string) => void;
}

export function AiSuggestionsPanel({
  aiInsights,
  acceptedMappings,
  onAcceptMapping,
}: AiSuggestionsPanelProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>
              Review AI-assisted schema mapping and fuzzy duplicate recommendations before export.
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" />
            {aiInsights.provider === "huggingface" ? "Hugging Face Active" : "Fallback Heuristics Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-sky-50/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-700" />
            <p className="font-medium text-foreground">Column Mapping Suggestions</p>
          </div>
          <div className="space-y-3">
            {aiInsights.suggestedMappings.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending AI schema suggestions.</p>
            )}
            {aiInsights.suggestedMappings.map((mapping) => (
              <div key={`${mapping.sourceHeader}-${mapping.suggestedField}`} className="rounded-md border bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {mapping.sourceHeader} {"->"} {mapping.suggestedField}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-sky-700">
                      Why this suggestion appeared
                    </p>
                    <p className="text-sm text-muted-foreground">{mapping.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{Math.round(mapping.confidence * 100)}%</Badge>
                    <Button size="sm" onClick={() => onAcceptMapping(mapping.sourceHeader, mapping.suggestedField)}>
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {Object.keys(acceptedMappings).length > 0 && (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <div className="mb-2 flex items-center gap-2 font-medium text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                Accepted mappings
              </div>
              <div className="space-y-1 text-sm text-emerald-900">
                {Object.entries(acceptedMappings).map(([sourceHeader, target]) => (
                  <p key={`${sourceHeader}-${target}`}>
                    {sourceHeader} {"->"} {target}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-amber-50/70 p-4">
          <div className="mb-3 flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-amber-700" />
            <p className="font-medium text-foreground">Fuzzy Duplicate Review</p>
          </div>
          <div className="space-y-3">
            {aiInsights.fuzzyDuplicates.length === 0 && (
              <p className="text-sm text-muted-foreground">No fuzzy duplicate pairs suggested.</p>
            )}
            {aiInsights.fuzzyDuplicates.map((suggestion) => (
              <div key={`${suggestion.leftRecordId}-${suggestion.rightRecordId}`} className="rounded-md border bg-background p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {suggestion.leftRecordId} row {suggestion.leftRowNumber} and {suggestion.rightRecordId} row {suggestion.rightRowNumber}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-700">
                      Why this needs review
                    </p>
                    <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                  </div>
                  <Badge variant="secondary">{Math.round(suggestion.confidence * 100)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
