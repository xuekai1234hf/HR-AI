import type { AuditResult } from "./schema.js";

const HEADER = ["employeeId", "employeeName", "employeeType", "riskLevel", "completionRate", "missingDocuments"];

function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}

function formatCompletionRate(completionRate: number): string {
  return `${Math.round(completionRate * 100)}%`;
}

export function auditResultsToCsv(results: AuditResult[]): string {
  const rows = results.map((result) =>
    [
      result.employeeId,
      result.employeeName,
      result.employeeType,
      result.riskLevel,
      formatCompletionRate(result.completionRate),
      result.missingDocuments.join("; ")
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  return [HEADER.join(","), ...rows].join("\n");
}
