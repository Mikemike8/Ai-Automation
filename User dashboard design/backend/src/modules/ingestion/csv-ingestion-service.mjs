import { REQUIRED_COLUMNS } from "../../shared/contracts.mjs";
import { suggestColumnMappings } from "../ai/column-mapping-service.mjs";

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

function normalizeHeader(value) {
  const sanitized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return HEADER_ALIASES[sanitized] ?? sanitized;
}

function parseLine(line) {
  return line.split(",").map((cell) => cell.trim());
}

export function ingestCsv(csv, options = {}) {
  const filename = options.filename || "upload.csv";
  const mappingOverrides = options.mappingOverrides ?? {};
  const lines = String(csv || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      filename,
      rowCount: 0,
      headers: [],
      missingColumns: [...REQUIRED_COLUMNS],
      previewRows: [],
      normalized: "",
    };
  }

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map((rawHeader) => {
    const override = mappingOverrides[rawHeader];
    return override ? String(override).trim().toLowerCase() : normalizeHeader(rawHeader);
  });
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
  const suggestedMappings = suggestColumnMappings(rawHeaders, headers);

  const previewRows = lines.slice(1, 6).map((line, index) => {
    const cells = parseLine(line);
    return {
      rowNumber: index + 2,
      values: Object.fromEntries(
        headers.map((header, cellIndex) => [header, cells[cellIndex] ?? ""]),
      ),
    };
  });

  const normalizedRows = lines.slice(1).map((line) => {
    const cells = parseLine(line);
    return headers.map((_, cellIndex) => cells[cellIndex] ?? "").join(",");
  });

  return {
    filename,
    rowCount: Math.max(lines.length - 1, 0),
    rawHeaders,
    headers,
    missingColumns,
    mappingOverrides,
    suggestedMappings,
    previewRows,
    normalized: [headers.join(","), ...normalizedRows].join("\n"),
  };
}
