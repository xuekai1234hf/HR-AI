import assert from "node:assert/strict";
import test from "node:test";
import { auditResultsToCsv } from "../src/csv.js";
import type { AuditResult } from "../src/schema.js";

test("auditResultsToCsv writes stable columns", () => {
  const results: AuditResult[] = [
    {
      employeeId: "E001",
      employeeName: "李雷",
      employeeType: "full_time",
      missingDocuments: [],
      completionRate: 1,
      riskLevel: "OK"
    }
  ];

  assert.equal(
    auditResultsToCsv(results),
    [
      "employeeId,employeeName,employeeType,riskLevel,completionRate,missingDocuments",
      "E001,李雷,full_time,OK,100%,"
    ].join("\n")
  );
});

test("auditResultsToCsv escapes commas and quotes", () => {
  const results: AuditResult[] = [
    {
      employeeId: "E002",
      employeeName: "Han, \"May\"",
      employeeType: "intern",
      missingDocuments: ["实习协议", "导师,确认表"],
      completionRate: 0.6,
      riskLevel: "BLOCKED"
    }
  ];

  assert.equal(
    auditResultsToCsv(results),
    [
      "employeeId,employeeName,employeeType,riskLevel,completionRate,missingDocuments",
      "E002,\"Han, \"\"May\"\"\",intern,BLOCKED,60%,\"实习协议; 导师,确认表\""
    ].join("\n")
  );
});
