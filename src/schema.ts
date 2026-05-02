export type Employee = {
  id: string;
  name: string;
  type: string;
  startDate: string;
  submittedDocuments: string[];
};

export type Rules = {
  commonRequiredDocuments: string[];
  typeRequiredDocuments: Record<string, string[]>;
};

export type RiskLevel = "OK" | "WARN" | "BLOCKED";

export type AuditResult = {
  employeeId: string;
  employeeName: string;
  employeeType: string;
  missingDocuments: string[];
  completionRate: number;
  riskLevel: RiskLevel;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value;
}

function requireStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array`);
  }

  return value.map((item, index) => requireString(item, `${field}[${index}]`));
}

export function parseEmployees(value: unknown): Employee[] {
  if (!Array.isArray(value)) {
    throw new Error("employees input must be an array");
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Employee at index ${index} must be an object`);
    }

    const id = requireString(item.id, `Employee at index ${index} id`);

    return {
      id,
      name: requireString(item.name, `Employee ${id} name`),
      type: requireString(item.type, `Employee ${id} type`),
      startDate: requireString(item.startDate, `Employee ${id} startDate`),
      submittedDocuments: requireStringArray(item.submittedDocuments, `Employee ${id} submittedDocuments`)
    };
  });
}

export function parseRules(value: unknown): Rules {
  if (!isRecord(value)) {
    throw new Error("rules input must be an object");
  }

  const commonRequiredDocuments = requireStringArray(
    value.commonRequiredDocuments,
    "rules.commonRequiredDocuments"
  );

  if (!isRecord(value.typeRequiredDocuments)) {
    throw new Error("rules.typeRequiredDocuments must be an object");
  }

  const typeRequiredDocuments: Record<string, string[]> = {};
  for (const [employeeType, documents] of Object.entries(value.typeRequiredDocuments)) {
    typeRequiredDocuments[employeeType] = requireStringArray(
      documents,
      `rules.typeRequiredDocuments.${employeeType}`
    );
  }

  return {
    commonRequiredDocuments,
    typeRequiredDocuments
  };
}
