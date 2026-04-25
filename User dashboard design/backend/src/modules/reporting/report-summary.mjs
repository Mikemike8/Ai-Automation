export function buildReportSummary(report) {
  return {
    totalRows: report.totalRows,
    cleanRows: report.cleanRows,
    duplicateRows: report.duplicateRows,
    issueCount: report.issues.length,
    missingColumns: report.missingColumns,
  };
}
