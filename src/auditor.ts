import type { AuditResult, Employee, RiskLevel, Rules } from "./schema.js";

function riskLevelForMissingCount(missingCount: number): RiskLevel {
  if (missingCount === 0) {
    return "OK";
  }

  if (missingCount === 1) {
    return "WARN";
  }

  return "BLOCKED";
}

function requiredDocumentsFor(employee: Employee, rules: Rules): string[] {
  const typeRequiredDocuments = rules.typeRequiredDocuments[employee.type];
  if (typeRequiredDocuments === undefined) {
    throw new Error(`Unknown employee type "${employee.type}" for employee ${employee.id}`);
  }

  return [...new Set([...rules.commonRequiredDocuments, ...typeRequiredDocuments])];
}

export function auditEmployees(employees: Employee[], rules: Rules): AuditResult[] {
  return employees.map((employee) => {
    const requiredDocuments = requiredDocumentsFor(employee, rules);
    const submittedDocuments = new Set(employee.submittedDocuments);
    const missingDocuments = requiredDocuments.filter((documentName) => !submittedDocuments.has(documentName));
    const submittedRequiredCount = requiredDocuments.length - missingDocuments.length;

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      employeeType: employee.type,
      missingDocuments,
      completionRate: requiredDocuments.length === 0 ? 1 : submittedRequiredCount / requiredDocuments.length,
      riskLevel: riskLevelForMissingCount(missingDocuments.length)
    };
  });
}
