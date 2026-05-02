import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runCli } from "../src/cli.js";

test("runCli reads inputs, writes report, and returns success", async () => {
  const dir = await mkdtemp(join(tmpdir(), "hr-audit-"));
  const employeesPath = join(dir, "employees.json");
  const rulesPath = join(dir, "rules.json");
  const outPath = join(dir, "report.csv");
  const output: string[] = [];
  const errors: string[] = [];

  await writeFile(
    rulesPath,
    JSON.stringify({
      commonRequiredDocuments: ["身份证", "银行卡"],
      typeRequiredDocuments: {
        full_time: ["劳动合同"]
      }
    })
  );

  await writeFile(
    employeesPath,
    JSON.stringify([
      {
        id: "E001",
        name: "李雷",
        type: "full_time",
        startDate: "2026-05-06",
        submittedDocuments: ["身份证", "银行卡", "劳动合同"]
      },
      {
        id: "E002",
        name: "韩梅梅",
        type: "full_time",
        startDate: "2026-05-08",
        submittedDocuments: ["身份证"]
      }
    ])
  );

  const exitCode = await runCli(
    ["--employees", employeesPath, "--rules", rulesPath, "--out", outPath],
    {
      stdout: (message) => output.push(message),
      stderr: (message) => errors.push(message)
    }
  );

  const report = await readFile(outPath, "utf8");

  assert.equal(exitCode, 0);
  assert.deepEqual(errors, []);
  assert.deepEqual(output, ["Audited 2 employees", "OK: 1", "WARN: 0", "BLOCKED: 1", `Report: ${outPath}`]);
  assert.equal(
    report,
    [
      "employeeId,employeeName,employeeType,riskLevel,completionRate,missingDocuments",
      "E001,李雷,full_time,OK,100%,",
      "E002,韩梅梅,full_time,BLOCKED,33%,银行卡; 劳动合同"
    ].join("\n")
  );
});
