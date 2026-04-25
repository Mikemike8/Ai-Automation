import { REQUIRED_COLUMNS } from "../../shared/contracts.mjs";

const COLUMN_VOCABULARY = {
  id: ["id", "identifier", "record", "recordid", "record_id", "clientid", "userid"],
  name: ["name", "fullname", "full_name", "customer", "client", "person", "contact"],
  email: ["email", "mail", "emailaddress", "email_address", "contactemail", "clientmail"],
  phone: ["phone", "mobile", "cell", "telephone", "phone_number", "mobile_number", "contactnumber"],
};

function sanitize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function tokenOverlapScore(source, targetTokens) {
  const sourceTokenized = source
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  if (sourceTokenized.length === 0) {
    return 0;
  }

  const matches = sourceTokenized.filter((token) =>
    targetTokens.some((candidate) => candidate.includes(token) || token.includes(candidate)),
  ).length;

  return matches / sourceTokenized.length;
}

function getBestCandidate(rawHeader) {
  const compact = sanitize(rawHeader);
  let best = null;

  for (const requiredColumn of REQUIRED_COLUMNS) {
    const candidates = COLUMN_VOCABULARY[requiredColumn] ?? [];

    for (const candidate of candidates) {
      const compactCandidate = sanitize(candidate);
      let score = 0;

      if (compact === compactCandidate) {
        score = 0.99;
      } else if (compact.includes(compactCandidate) || compactCandidate.includes(compact)) {
        score = 0.9;
      } else {
        score = tokenOverlapScore(rawHeader, candidates.map(sanitize)) * 0.8;
      }

      if (!best || score > best.confidence) {
        best = {
          sourceHeader: rawHeader,
          suggestedField: requiredColumn,
          confidence: Number(score.toFixed(2)),
          reason: `"${rawHeader}" looks like "${requiredColumn}" because it matches common ${requiredColumn} header names such as ${candidates.slice(0, 3).join(", ")}.`,
        };
      }
    }
  }

  return best && best.confidence >= 0.55 ? best : null;
}

export function suggestColumnMappings(rawHeaders, normalizedHeaders) {
  return rawHeaders
    .map((rawHeader, index) => {
      const normalized = normalizedHeaders[index];
      if (REQUIRED_COLUMNS.includes(normalized)) {
        return null;
      }

      return getBestCandidate(rawHeader);
    })
    .filter(Boolean);
}
