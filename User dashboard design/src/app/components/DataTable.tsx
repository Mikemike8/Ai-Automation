import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Copy, Download, FileWarning, Mail, MoreHorizontal, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ParsedRow, ValidationReport, IssueType, ValidationIssue } from "../lib/validation";
import { Input } from "./ui/input";
import { AiInsights } from "../lib/ai";

interface DataTableProps {
  report: ValidationReport;
  aiInsights: AiInsights;
}

const statusConfig: Record<IssueType, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  missing_column: {
    label: "Missing Column",
    variant: "outline",
    icon: AlertCircle,
  },
  missing_value: {
    label: "Missing Value",
    variant: "outline",
    icon: AlertCircle,
  },
  duplicate: {
    label: "Duplicate",
    variant: "default",
    icon: Copy,
  },
  invalid_email: {
    label: "Invalid",
    variant: "destructive",
    icon: Mail,
  },
  invalid_phone: {
    label: "Phone Error",
    variant: "outline",
    icon: FileWarning,
  },
};

export function DataTable({ report, aiInsights }: DataTableProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | IssueType>("all");
  const [search, setSearch] = useState("");

  const detectedIssues = useMemo<ValidationIssue[]>(() => {
    const fuzzyDuplicateIssues = aiInsights.fuzzyDuplicates.map((suggestion) => ({
      id: `fuzzy-duplicate-${suggestion.leftRecordId}-${suggestion.rightRecordId}`,
      type: "duplicate" as const,
      severity: "medium" as const,
      rowNumber: suggestion.rightRowNumber,
      recordId: suggestion.rightRecordId,
      field: "name, email, phone",
      message: `Possible fuzzy duplicate of ${suggestion.leftRecordId} on row ${suggestion.leftRowNumber}.`,
      suggestion: suggestion.reason,
    }));

    return [...report.issues, ...fuzzyDuplicateIssues];
  }, [aiInsights.fuzzyDuplicates, report.issues]);

  const filteredIssues = useMemo(() => {
    return detectedIssues.filter((issue) => {
      const matchesType = statusFilter === "all" ? false : issue.type === statusFilter;
      const haystack = `${issue.recordId} ${issue.field} ${issue.message} ${issue.suggestion}`.toLowerCase();
      const matchesSearch = search.trim() ? haystack.includes(search.trim().toLowerCase()) : true;
      return matchesType && matchesSearch;
    });
  }, [detectedIssues, search, statusFilter]);

  const allRows = useMemo(() => {
    return report.rows.filter((row) => {
      const haystack = `${row.rowNumber} ${row.id} ${row.name} ${row.email} ${row.phone} ${Object.values(row.values).join(" ")}`.toLowerCase();
      return search.trim() ? haystack.includes(search.trim().toLowerCase()) : true;
    });
  }, [report.rows, search]);

  function exportReport() {
    const headers = statusFilter === "all"
      ? ["row", "record", "name", "email", "phone", "status"]
      : ["row", "record", "type", "field", "message", "suggestion"];
    const lines = statusFilter === "all"
      ? allRows.map((row) =>
        [row.rowNumber, row.id, row.name, row.email, row.phone, getRowIssueSummary(row, detectedIssues)]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      : filteredIssues.map((issue) =>
        [issue.rowNumber ?? "Header", issue.recordId, issue.type, issue.field, issue.message, issue.suggestion]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
      );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "validation-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Detected Issues</CardTitle>
            <CardDescription>
              Review each dataset or row-level issue before continuing the automation flow.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportReport}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={statusFilter === "all" ? "Search rows or values" : "Search record, field, or message"}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>
              All
            </Button>
            {Object.entries(statusConfig).map(([type, config]) => (
              <Button
                key={type}
                size="sm"
                variant={statusFilter === type ? "default" : "outline"}
                onClick={() => setStatusFilter(type as IssueType)}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Row</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Status</TableHead>
                {statusFilter === "all" ? (
                  <>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Field</TableHead>
                    <TableHead>Issue Detected</TableHead>
                    <TableHead>Suggestion</TableHead>
                  </>
                )}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusFilter === "all" && allRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>No rows match the current search.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {statusFilter === "all" && allRows.map((row) => {
                const rowIssues = getRowIssues(row, detectedIssues);
                const hasIssues = rowIssues.length > 0;

                return (
                  <TableRow key={`${row.rowNumber}-${row.id}`}>
                    <TableCell className="font-medium">{row.rowNumber}</TableCell>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Badge variant={hasIssues ? "outline" : "secondary"} className="gap-1">
                        {hasIssues ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {hasIssues ? `${rowIssues.length} Issue${rowIssues.length === 1 ? "" : "s"}` : "Clean"}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.name || "—"}</TableCell>
                    <TableCell>{row.email || "—"}</TableCell>
                    <TableCell>{row.phone || "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View row details</DropdownMenuItem>
                          <DropdownMenuItem>Jump to row</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Mark as reviewed</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {statusFilter !== "all" && filteredIssues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>No issues match the current filter.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {statusFilter !== "all" && filteredIssues.map((issue) => {
                const config = statusConfig[issue.type];
                const StatusIcon = config.icon;

                return (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.rowNumber ?? "Header"}</TableCell>
                    <TableCell>{issue.recordId}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{issue.field}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {issue.message}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{issue.suggestion}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Jump to row</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Auto-fix issue</DropdownMenuItem>
                          <DropdownMenuItem>Mark as reviewed</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Ignore issue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function getRowIssues(row: ParsedRow, detectedIssues: ValidationIssue[]) {
  return detectedIssues.filter((issue) => issue.rowNumber === row.rowNumber);
}

function getRowIssueSummary(row: ParsedRow, detectedIssues: ValidationIssue[]) {
  const rowIssues = getRowIssues(row, detectedIssues);

  if (rowIssues.length === 0) {
    return "Clean";
  }

  return rowIssues.map((issue) => issue.type).join("; ");
}
