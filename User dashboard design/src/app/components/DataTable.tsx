import { useState } from "react";
import { MoreHorizontal, ArrowUpDown, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
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

type IssueType = "missing_column" | "duplicate" | "invalid" | "format_error" | "clean";

interface DataEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: IssueType;
  issue: string;
  timestamp: string;
}

const mockData: DataEntry[] = [
  {
    id: "E-001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 234-567-8900",
    status: "clean",
    issue: "None",
    timestamp: "2026-04-25 09:23",
  },
  {
    id: "E-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "",
    status: "missing_column",
    issue: "Phone number missing",
    timestamp: "2026-04-25 09:24",
  },
  {
    id: "E-003",
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "+1 345-678-9012",
    status: "clean",
    issue: "None",
    timestamp: "2026-04-25 09:25",
  },
  {
    id: "E-004",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1 456-789-0123",
    status: "duplicate",
    issue: "Duplicate of E-012",
    timestamp: "2026-04-25 09:26",
  },
  {
    id: "E-005",
    name: "Robert Wilson",
    email: "invalid-email",
    phone: "+1 567-890-1234",
    status: "invalid",
    issue: "Invalid email format",
    timestamp: "2026-04-25 09:27",
  },
  {
    id: "E-006",
    name: "Jennifer Martinez",
    email: "j.martinez@example.com",
    phone: "123456",
    status: "format_error",
    issue: "Phone format invalid",
    timestamp: "2026-04-25 09:28",
  },
  {
    id: "E-007",
    name: "David Anderson",
    email: "d.anderson@example.com",
    phone: "+1 678-901-2345",
    status: "clean",
    issue: "None",
    timestamp: "2026-04-25 09:29",
  },
  {
    id: "E-008",
    name: "Lisa Taylor",
    email: "lisa.t@example.com",
    phone: "",
    status: "missing_column",
    issue: "Phone number missing",
    timestamp: "2026-04-25 09:30",
  },
];

const statusConfig: Record<IssueType, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  clean: {
    label: "Clean",
    variant: "secondary",
    icon: CheckCircle2,
  },
  missing_column: {
    label: "Missing Data",
    variant: "outline",
    icon: AlertCircle,
  },
  duplicate: {
    label: "Duplicate",
    variant: "default",
    icon: AlertCircle,
  },
  invalid: {
    label: "Invalid",
    variant: "destructive",
    icon: XCircle,
  },
  format_error: {
    label: "Format Error",
    variant: "outline",
    icon: AlertCircle,
  },
};

export function DataTable() {
  const [data, setData] = useState<DataEntry[]>(mockData);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>
              Latest data entries with AI-detected issues highlighted
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issue Detected</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => {
                const config = statusConfig[entry.status];
                const StatusIcon = config.icon;

                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.id}</TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>
                      <span className={entry.status === "invalid" ? "text-destructive" : ""}>
                        {entry.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={entry.status === "missing_column" || entry.status === "format_error" ? "text-muted-foreground italic" : ""}>
                        {entry.phone || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.issue}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.timestamp}
                    </TableCell>
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
                          <DropdownMenuItem>Edit entry</DropdownMenuItem>
                          {entry.status !== "clean" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Auto-fix issue</DropdownMenuItem>
                              <DropdownMenuItem>Mark as reviewed</DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete entry
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
