const REQUIRED_COLUMNS = ["id", "name", "email", "phone"];

const HEADER_ALIASES = {
  identifier: "id",
  recordid: "id",
  fullname: "name",
  full_name: "name",
  emailaddress: "email",
  email_address: "email",
  phonenumber: "phone",
  phone_number: "phone",
  mobile: "phone",
  mobilephone: "phone",
};

export const SAMPLE_CSV = `id,name,email,phone
E-001,John Smith,john.smith@example.com,+1 234-567-8900
E-002,Sarah Johnson,sarah.j@example.com,
E-003,Michael Chen,m.chen@example.com,+1 345-678-9012
E-004,Emily Davis,emily.davis@example.com,+1 456-789-0123
E-005,Robert Wilson,invalid-email,+1 567-890-1234
E-006,Jennifer Martinez,j.martinez@example.com,123456
E-007,David Anderson,d.anderson@example.com,+1 678-901-2345
E-008,Emily Davis,emily.davis@example.com,+1 456-789-0123`;

export const DEMO_DATASETS = {
  "Mixed Issues": SAMPLE_CSV,
  "Missing Column": `id,name,email
E-101,Ana Lopez,ana@example.com
E-102,Chris Shaw,chris@example.com`,
  Duplicates: `id,name,email,phone
E-201,Taylor Reed,taylor@example.com,+1 222-333-4444
E-202,Taylor Reed,taylor@example.com,+1 222-333-4444
E-203,Morgan Blake,morgan@example.com,+1 888-999-0000`,
  Clean: `id,name,email,phone
E-301,Nina Patel,nina@example.com,+1 312-555-0101
E-302,Leo Grant,leo@example.com,+1 312-555-0102
E-303,Ava Brooks,ava@example.com,+1 312-555-0103`,
};

function normalizeHeader(value) {
  const sanitized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return HEADER_ALIASES[sanitized] ?? sanitized;
}

function parseLine(line) {
  return line.split(",").map((cell) => cell.trim());
}

function buildIssue(issue, rowNumber, suffix) {
  return {
    ...issue,
    rowNumber,
    id: `${issue.type}-${rowNumber ?? "dataset"}-${suffix}`,
  };
}

export function analyzeCsv(input) {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      headers: [],
      rows: [],
      issues: [],
      totalRows: 0,
      cleanRows: 0,
      duplicateRows: 0,
      missingColumns: [...REQUIRED_COLUMNS],
    };
  }

  const headers = parseLine(lines[0]).map(normalizeHeader);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
  const datasetIssues = missingColumns.map((column) =>
    buildIssue(
      {
        type: "missing_column",
        severity: "high",
        recordId: "Dataset",
        field: column,
        message: `Required column "${column}" is missing from the file header.`,
        suggestion: `Add a "${column}" column before importing this dataset.`,
      },
      null,
      column,
    ),
  );

  const rows = lines.slice(1).map((line, index) => {
    const cells = parseLine(line);
    const values = Object.fromEntries(
      headers.map((header, cellIndex) => [header, cells[cellIndex] ?? ""]),
    );
    const rowNumber = index + 2;
    const row = {
      rowNumber,
      id: values.id || `ROW-${index + 1}`,
      name: values.name || "",
      email: values.email || "",
      phone: values.phone || "",
      values,
      issues: [],
    };

    for (const column of REQUIRED_COLUMNS) {
      if (!headers.includes(column)) {
        continue;
      }

      if (!values[column]) {
        row.issues.push(
          buildIssue(
            {
              type: "missing_value",
              severity: column === "id" ? "high" : "medium",
              recordId: row.id,
              field: column,
              message: `Required value "${column}" is blank on row ${rowNumber}.`,
              suggestion: `Fill in the ${column} value for this row.`,
            },
            rowNumber,
            column,
          ),
        );
      }
    }

    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      row.issues.push(
        buildIssue(
          {
            type: "invalid_email",
            severity: "medium",
            recordId: row.id,
            field: "email",
            message: `Email "${row.email}" is not in a valid format.`,
            suggestion: "Use a valid email address such as name@company.com.",
          },
          rowNumber,
          "email",
        ),
      );
    }

    if (row.phone && !/^\+?[0-9()\-\s]{10,}$/.test(row.phone)) {
      row.issues.push(
        buildIssue(
          {
            type: "invalid_phone",
            severity: "low",
            recordId: row.id,
            field: "phone",
            message: `Phone value "${row.phone}" does not match the expected format.`,
            suggestion: "Use at least 10 digits and include country code when available.",
          },
          rowNumber,
          "phone",
        ),
      );
    }

    return row;
  });

  const duplicateBuckets = new Map();
  for (const row of rows) {
    const duplicateKey = [row.name, row.email, row.phone]
      .map((value) => value.trim().toLowerCase())
      .join("|");

    if (!duplicateKey.replace(/\|/g, "")) {
      continue;
    }

    const bucket = duplicateBuckets.get(duplicateKey) ?? [];
    bucket.push(row);
    duplicateBuckets.set(duplicateKey, bucket);
  }

  for (const bucket of duplicateBuckets.values()) {
    if (bucket.length < 2) {
      continue;
    }

    const firstRow = bucket[0];
    for (const row of bucket.slice(1)) {
      row.issues.push(
        buildIssue(
          {
            type: "duplicate",
            severity: "high",
            recordId: row.id,
            field: "row",
            message: `Possible duplicate detected. Matches row ${firstRow.rowNumber}.`,
            suggestion: "Merge or delete the duplicate record before export.",
          },
          row.rowNumber,
          "duplicate",
        ),
      );
    }
  }

  const rowIssues = rows.flatMap((row) => row.issues);
  const issues = [...datasetIssues, ...rowIssues];
  const duplicateRows = rows.filter((row) =>
    row.issues.some((issue) => issue.type === "duplicate"),
  ).length;
  const cleanRows = rows.filter((row) => row.issues.length === 0).length;

  return {
    headers,
    rows,
    issues,
    totalRows: rows.length,
    cleanRows,
    duplicateRows,
    missingColumns,
  };
}
