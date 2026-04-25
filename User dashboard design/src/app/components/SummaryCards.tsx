import { AlertTriangle, Copy, Columns3, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { ValidationReport } from "../lib/validation";
import { AiInsights } from "../lib/ai";

interface SummaryCardsProps {
  report: ValidationReport;
  aiInsights: AiInsights;
}

export function SummaryCards({ report, aiInsights }: SummaryCardsProps) {
  const issueTypes = [
    {
      title: "Missing Columns",
      count: report.issues.filter((issue) => issue.type === "missing_column" || issue.type === "missing_value").length,
      total: Math.max(report.totalRows, 1),
      icon: Columns3,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Duplicate Rows",
      count: report.issues.filter((issue) => issue.type === "duplicate").length + aiInsights.fuzzyDuplicates.length,
      total: Math.max(report.totalRows, 1),
      icon: Copy,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Invalid Emails",
      count: report.issues.filter((issue) => issue.type === "invalid_email").length,
      total: Math.max(report.totalRows, 1),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Phone Errors",
      count: report.issues.filter((issue) => issue.type === "invalid_phone").length,
      total: Math.max(report.totalRows, 1),
      icon: FileWarning,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="my-6">
      <h2 className="mb-4">Data Quality Issues</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {issueTypes.map((issue) => {
          const Icon = issue.icon;
          const percentage = ((issue.count / issue.total) * 100).toFixed(1);

          return (
            <Card key={issue.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{issue.title}</CardTitle>
                <div className={`rounded-full p-2 ${issue.bgColor}`}>
                  <Icon className={`h-4 w-4 ${issue.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{issue.count.toLocaleString()}</div>
                <div className="mt-2 space-y-1">
                  <Progress value={parseFloat(percentage)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {percentage}% of current rows
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
