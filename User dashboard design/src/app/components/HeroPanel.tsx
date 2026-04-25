import { TrendingUp, TrendingDown, Database, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

const activityData = [
  { name: "Mon", processed: 245, errors: 12 },
  { name: "Tue", processed: 312, errors: 8 },
  { name: "Wed", processed: 289, errors: 15 },
  { name: "Thu", processed: 356, errors: 6 },
  { name: "Fri", processed: 423, errors: 9 },
  { name: "Sat", processed: 198, errors: 4 },
  { name: "Sun", processed: 167, errors: 3 },
];

const issueDistribution = [
  { name: "Missing Columns", value: 234 },
  { name: "Duplicates", value: 145 },
  { name: "Invalid Data", value: 89 },
  { name: "Format Errors", value: 67 },
];

const activityChartConfig = {
  processed: {
    label: "Processed",
    color: "hsl(var(--chart-1))",
  },
  errors: {
    label: "Errors",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const issueChartConfig = {
  value: {
    label: "Issues",
  },
  missingColumns: {
    label: "Missing Columns",
    color: "hsl(var(--chart-1))",
  },
  duplicates: {
    label: "Duplicates",
    color: "hsl(var(--chart-2))",
  },
  invalidData: {
    label: "Invalid Data",
    color: "hsl(var(--chart-3))",
  },
  formatErrors: {
    label: "Format Errors",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function HeroPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Data Quality Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights for your data entry automation
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          All Systems Operational
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">15,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                +12.5%
              </span>{" "}
              from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Clean Records</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">14,712</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-green-600">
                96.5% accuracy rate
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
            <div className="text-2xl">535</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-red-600">
                <TrendingDown className="h-3 w-3" />
                -8.2%
              </span>{" "}
              from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Auto-Fixed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">412</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-green-600">
                77% resolution rate
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Processing Activity</CardTitle>
            <CardDescription>Daily entries processed over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityChartConfig} className="h-[300px] w-full">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="processed" fill="var(--color-processed)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="errors" fill="var(--color-errors)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Issue Distribution</CardTitle>
            <CardDescription>Breakdown of detected data issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={issueChartConfig} className="h-[300px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={issueDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {issueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
