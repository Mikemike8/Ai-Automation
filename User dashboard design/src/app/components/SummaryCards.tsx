import { AlertTriangle, Copy, Columns3, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

const issueTypes = [
  {
    title: "Missing Columns",
    count: 234,
    total: 15247,
    icon: Columns3,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950",
  },
  {
    title: "Duplicate Rows",
    count: 145,
    total: 15247,
    icon: Copy,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
  },
  {
    title: "Invalid Data",
    count: 89,
    total: 15247,
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-950",
  },
  {
    title: "Format Errors",
    count: 67,
    total: 15247,
    icon: FileWarning,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-950",
  },
];

export function SummaryCards() {
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
                    {percentage}% of total entries
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
