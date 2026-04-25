function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function similarity(a, b) {
  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length > b.length ? a : b;

  let matches = 0;
  for (const char of shorter) {
    if (longer.includes(char)) {
      matches += 1;
    }
  }

  return matches / longer.length;
}

export function detectFuzzyDuplicates(rows) {
  const suggestions = [];

  for (let index = 0; index < rows.length; index += 1) {
    const current = rows[index];

    for (let compareIndex = index + 1; compareIndex < rows.length; compareIndex += 1) {
      const other = rows[compareIndex];
      const nameScore = similarity(normalizeText(current.name), normalizeText(other.name));
      const emailScore = similarity(normalizeText(current.email), normalizeText(other.email));
      const phoneScore = similarity(normalizeText(current.phone), normalizeText(other.phone));
      const combinedScore = Number(((nameScore * 0.5) + (emailScore * 0.3) + (phoneScore * 0.2)).toFixed(2));

      if (combinedScore < 0.72 || combinedScore >= 0.99) {
        continue;
      }

      suggestions.push({
        leftRecordId: current.id,
        rightRecordId: other.id,
        leftRowNumber: current.rowNumber,
        rightRowNumber: other.rowNumber,
        confidence: combinedScore,
        reason: `These rows need review because their name, email, and phone values are ${Math.round(combinedScore * 100)}% similar overall.`,
      });
    }
  }

  return suggestions;
}
