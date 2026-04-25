export const BAD_TEST_CSV_PACK = {
  "missing-columns-demo.csv": `id,name,email
E-401,Ana Lopez,ana@example.com
E-402,Chris Shaw,chris@example.com
E-403,Nina Patel,nina@example.com`,
  "invalid-formats-demo.csv": `id,name,email,phone
E-501,Robert Wilson,invalid-email,+1 567-890-1234
E-502,Jennifer Martinez,j.martinez@example,123456
E-503,Clara Adams,clara.adams@example.com,abc-555-0102`,
  "duplicate-rows-demo.csv": `id,name,email,phone
E-601,Emily Davis,emily.davis@example.com,+1 456-789-0123
E-602,Emily Davis,emily.davis@example.com,+1 456-789-0123
E-603,Jon Smith,jon.smith@example.com,3125550101
E-604,John Smith,john.smith@example.com,312-555-0101`,
} as const;

export function downloadCsv(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
