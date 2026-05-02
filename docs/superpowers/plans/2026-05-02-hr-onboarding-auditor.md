# HR Onboarding Auditor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TypeScript CLI that audits onboarding employee documents from JSON input and writes a CSV report.

**Architecture:** The CLI is split into small modules: schema validation, pure audit logic, CSV serialization, CLI orchestration, and an executable entrypoint. Business logic remains filesystem-free so most behavior is tested with fast unit tests, while CLI behavior is covered by one integration-style test using temporary files.

**Tech Stack:** Node.js, TypeScript, Node built-in test runner, npm scripts.

---

## Scope Check

This plan implements one subsystem: a local command-line onboarding document auditor. It does not include AI, web UI, database storage, or remote integrations.

The workspace is not currently a git repository. Commit steps are included for Superpowers practice, but execution must either initialize git after explicit user approval or record that commit steps were skipped because no repository exists.

## File Structure

Create and maintain these files:

- `package.json`: npm scripts and TypeScript dev dependency.
- `tsconfig.json`: TypeScript compiler settings for source and tests.
- `.gitignore`: local generated folders.
- `src/schema.ts`: exported types and runtime validation functions for parsed JSON.
- `src/auditor.ts`: pure audit rules and risk calculation.
- `src/csv.ts`: stable CSV serialization and escaping.
- `src/cli.ts`: command parsing, file IO, audit execution, summary printing.
- `src/index.ts`: executable entrypoint.
- `test/schema.test.ts`: schema validation coverage.
- `test/auditor.test.ts`: audit business-rule coverage.
- `test/csv.test.ts`: CSV output coverage.
- `test/cli.test.ts`: CLI happy-path coverage with temporary files.
- `data/employees.json`: sample employee input.
- `data/rules.json`: sample rule input.
- `reports/.gitkeep`: keeps the report directory present.

Generated file:

- `reports/onboarding-audit.csv`: created by `npm run audit`.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/index.ts`
- Create: `src/cli.ts`
- Create: `data/employees.json`
- Create: `data/rules.json`
- Create: `reports/.gitkeep`

- [ ] **Step 1: Create package metadata**

Create `package.json`:

```json
{
  "name": "hr-onboarding-auditor",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "npm run build && node --test \"dist/test/*.test.js\"",
    "audit": "npm run build && node dist/src/index.js"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Create TypeScript configuration**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": ".",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

- [ ] **Step 3: Create generated-file ignore rules**

Create `.gitignore`:

```gitignore
node_modules/
dist/
reports/*.csv
```

- [ ] **Step 4: Create temporary CLI placeholders**

Create `src/cli.ts`:

```ts
export async function runCli(_argv: string[] = process.argv.slice(2)): Promise<number> {
  console.error("CLI is not implemented yet.");
  return 1;
}
```

Create `src/index.ts`:

```ts
import { runCli } from "./cli.js";

const exitCode = await runCli();
process.exitCode = exitCode;
```

- [ ] **Step 5: Create sample input files**

Create `data/rules.json`:

```json
{
  "commonRequiredDocuments": ["身份证", "银行卡", "个人信息登记表"],
  "typeRequiredDocuments": {
    "full_time": ["学历证明", "劳动合同"],
    "intern": ["学生证", "实习协议"],
    "contractor": ["服务协议"]
  }
}
```

Create `data/employees.json`:

```json
[
  {
    "id": "E001",
    "name": "李雷",
    "type": "full_time",
    "startDate": "2026-05-06",
    "submittedDocuments": ["身份证", "银行卡", "个人信息登记表", "学历证明", "劳动合同"]
  },
  {
    "id": "E002",
    "name": "韩梅梅",
    "type": "intern",
    "startDate": "2026-05-08",
    "submittedDocuments": ["身份证", "银行卡", "个人信息登记表", "学生证"]
  },
  {
    "id": "E003",
    "name": "王五",
    "type": "contractor",
    "startDate": "2026-05-10",
    "submittedDocuments": ["身份证", "服务协议"]
  }
]
```

Create empty file `reports/.gitkeep`.

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules/` and `package-lock.json` are created. If network access is blocked, rerun with the required approval path for dependency installation.

- [ ] **Step 7: Run build to confirm scaffold compiles**

Run:

```bash
npm run build
```

Expected: `tsc` reports errors about missing Node globals if `@types/node` is not available. If that happens, update Task 1 Step 1 `package.json` devDependencies to include `"@types/node": "^24.10.0"`, run `npm install`, and rerun `npm run build`.

Expected after Node types are installed: PASS with no TypeScript errors.

- [ ] **Step 8: Commit scaffold**

If this directory is a git repository, run:

```bash
git add package.json package-lock.json tsconfig.json .gitignore src/index.ts src/cli.ts data/employees.json data/rules.json reports/.gitkeep
git commit -m "chore: scaffold onboarding auditor"
```

If this directory is not a git repository, record: `Skipped commit: workspace is not a git repository.`

## Task 2: Schema Validation

**Files:**
- Create: `src/schema.ts`
- Create: `test/schema.test.ts`

- [ ] **Step 1: Write failing schema tests**

Create `test/schema.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { parseEmployees, parseRules } from "../src/schema.js";

test("parseEmployees accepts valid employee records", () => {
  const employees = parseEmployees([
    {
      id: "E001",
      name: "李雷",
      type: "full_time",
      startDate: "2026-05-06",
      submittedDocuments: ["身份证", "银行卡"]
    }
  ]);

  assert.equal(employees[0].id, "E001");
  assert.deepEqual(employees[0].submittedDocuments, ["身份证", "银行卡"]);
});

test("parseEmployees rejects non-array submittedDocuments with employee id", () => {
  assert.throws(
    () =>
      parseEmployees([
        {
          id: "E002",
          name: "韩梅梅",
          type: "intern",
          startDate: "2026-05-08",
          submittedDocuments: "身份证"
        }
      ]),
    /Employee E002 submittedDocuments must be an array/
  );
});

test("parseRules accepts valid rules", () => {
  const rules = parseRules({
    commonRequiredDocuments: ["身份证"],
    typeRequiredDocuments: {
      full_time: ["劳动合同"]
    }
  });

  assert.deepEqual(rules.commonRequiredDocuments, ["身份证"]);
  assert.deepEqual(rules.typeRequiredDocuments.full_time, ["劳动合同"]);
});

test("parseRules rejects missing commonRequiredDocuments", () => {
  assert.throws(
    () =>
      parseRules({
        typeRequiredDocuments: {
          full_time: ["劳动合同"]
        }
      }),
    /rules.commonRequiredDocuments must be an array/
  );
});
```

- [ ] **Step 2: Run schema tests to verify they fail**

Run:

```bash
npm test
```

Expected: FAIL because `src/schema.ts` does not exist or does not export `parseEmployees` and `parseRules`.

- [ ] **Step 3: Implement schema validation**

Create `src/schema.ts`:

```ts
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
```

- [ ] **Step 4: Run schema tests to verify they pass**

Run:

```bash
npm test
```

Expected: PASS for `schema.test.ts`. Existing placeholder CLI code may compile successfully.

- [ ] **Step 5: Commit schema validation**

If this directory is a git repository, run:

```bash
git add src/schema.ts test/schema.test.ts
git commit -m "feat: add input schema validation"
```

If this directory is not a git repository, record: `Skipped commit: workspace is not a git repository.`

## Task 3: Audit Logic

**Files:**
- Create: `src/auditor.ts`
- Create: `test/auditor.test.ts`

- [ ] **Step 1: Write failing audit tests**

Create `test/auditor.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { auditEmployees } from "../src/auditor.js";
import type { Employee, Rules } from "../src/schema.js";

const rules: Rules = {
  commonRequiredDocuments: ["身份证", "银行卡", "个人信息登记表"],
  typeRequiredDocuments: {
    full_time: ["学历证明", "劳动合同"],
    intern: ["学生证", "实习协议"]
  }
};

test("auditEmployees returns OK when all required documents are submitted", () => {
  const employees: Employee[] = [
    {
      id: "E001",
      name: "李雷",
      type: "full_time",
      startDate: "2026-05-06",
      submittedDocuments: ["身份证", "银行卡", "个人信息登记表", "学历证明", "劳动合同"]
    }
  ];

  const results = auditEmployees(employees, rules);

  assert.deepEqual(results[0], {
    employeeId: "E001",
    employeeName: "李雷",
    employeeType: "full_time",
    missingDocuments: [],
    completionRate: 1,
    riskLevel: "OK"
  });
});

test("auditEmployees returns WARN when one document is missing", () => {
  const employees: Employee[] = [
    {
      id: "E002",
      name: "韩梅梅",
      type: "intern",
      startDate: "2026-05-08",
      submittedDocuments: ["身份证", "银行卡", "个人信息登记表", "学生证"]
    }
  ];

  const results = auditEmployees(employees, rules);

  assert.deepEqual(results[0].missingDocuments, ["实习协议"]);
  assert.equal(results[0].completionRate, 0.8);
  assert.equal(results[0].riskLevel, "WARN");
});

test("auditEmployees returns BLOCKED when two or more documents are missing", () => {
  const employees: Employee[] = [
    {
      id: "E003",
      name: "王五",
      type: "full_time",
      startDate: "2026-05-10",
      submittedDocuments: ["身份证", "银行卡"]
    }
  ];

  const results = auditEmployees(employees, rules);

  assert.deepEqual(results[0].missingDocuments, ["个人信息登记表", "学历证明", "劳动合同"]);
  assert.equal(results[0].completionRate, 0.4);
  assert.equal(results[0].riskLevel, "BLOCKED");
});

test("auditEmployees de-duplicates repeated required documents", () => {
  const duplicatedRules: Rules = {
    commonRequiredDocuments: ["身份证", "银行卡"],
    typeRequiredDocuments: {
      full_time: ["身份证", "劳动合同"]
    }
  };

  const employees: Employee[] = [
    {
      id: "E004",
      name: "赵六",
      type: "full_time",
      startDate: "2026-05-11",
      submittedDocuments: ["身份证"]
    }
  ];

  const results = auditEmployees(employees, duplicatedRules);

  assert.deepEqual(results[0].missingDocuments, ["银行卡", "劳动合同"]);
  assert.equal(results[0].completionRate, 1 / 3);
});

test("auditEmployees rejects unknown employee type with employee id", () => {
  const employees: Employee[] = [
    {
      id: "E005",
      name: "钱七",
      type: "advisor",
      startDate: "2026-05-12",
      submittedDocuments: ["身份证"]
    }
  ];

  assert.throws(() => auditEmployees(employees, rules), /Unknown employee type "advisor" for employee E005/);
});
```

- [ ] **Step 2: Run audit tests to verify they fail**

Run:

```bash
npm test
```

Expected: FAIL because `src/auditor.ts` does not exist or does not export `auditEmployees`.

- [ ] **Step 3: Implement audit logic**

Create `src/auditor.ts`:

```ts
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
```

- [ ] **Step 4: Run audit tests to verify they pass**

Run:

```bash
npm test
```

Expected: PASS for `schema.test.ts` and `auditor.test.ts`.

- [ ] **Step 5: Commit audit logic**

If this directory is a git repository, run:

```bash
git add src/auditor.ts test/auditor.test.ts
git commit -m "feat: audit onboarding documents"
```

If this directory is not a git repository, record: `Skipped commit: workspace is not a git repository.`

## Task 4: CSV Serialization

**Files:**
- Create: `src/csv.ts`
- Create: `test/csv.test.ts`

- [ ] **Step 1: Write failing CSV tests**

Create `test/csv.test.ts`:

```ts
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
```

- [ ] **Step 2: Run CSV tests to verify they fail**

Run:

```bash
npm test
```

Expected: FAIL because `src/csv.ts` does not exist or does not export `auditResultsToCsv`.

- [ ] **Step 3: Implement CSV serialization**

Create `src/csv.ts`:

```ts
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
```

- [ ] **Step 4: Run CSV tests to verify they pass**

Run:

```bash
npm test
```

Expected: PASS for schema, auditor, and CSV tests.

- [ ] **Step 5: Commit CSV serialization**

If this directory is a git repository, run:

```bash
git add src/csv.ts test/csv.test.ts
git commit -m "feat: export audit results as csv"
```

If this directory is not a git repository, record: `Skipped commit: workspace is not a git repository.`

## Task 5: CLI Orchestration

**Files:**
- Modify: `src/cli.ts`
- Create: `test/cli.test.ts`

- [ ] **Step 1: Write failing CLI happy-path test**

Create `test/cli.test.ts`:

```ts
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
```

- [ ] **Step 2: Run CLI test to verify it fails**

Run:

```bash
npm test
```

Expected: FAIL because current `runCli` only prints `CLI is not implemented yet.` and returns `1`.

- [ ] **Step 3: Implement CLI orchestration**

Replace `src/cli.ts` with:

```ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { auditEmployees } from "./auditor.js";
import { auditResultsToCsv } from "./csv.js";
import { parseEmployees, parseRules } from "./schema.js";
import type { AuditResult } from "./schema.js";

type CliOptions = {
  employeesPath: string;
  rulesPath: string;
  outPath: string;
};

type CliStreams = {
  stdout: (message: string) => void;
  stderr: (message: string) => void;
};

const DEFAULT_OPTIONS: CliOptions = {
  employeesPath: "data/employees.json",
  rulesPath: "data/rules.json",
  outPath: "reports/onboarding-audit.csv"
};

function parseArgs(argv: string[]): CliOptions {
  const options = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === "--employees" && value !== undefined) {
      options.employeesPath = value;
      index += 1;
      continue;
    }

    if (arg === "--rules" && value !== undefined) {
      options.rulesPath = value;
      index += 1;
      continue;
    }

    if (arg === "--out" && value !== undefined) {
      options.outPath = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown or incomplete argument: ${arg}`);
  }

  return options;
}

async function readJsonFile(path: string): Promise<unknown> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as unknown;
}

function countByRisk(results: AuditResult[], riskLevel: AuditResult["riskLevel"]): number {
  return results.filter((result) => result.riskLevel === riskLevel).length;
}

function printSummary(results: AuditResult[], outPath: string, stdout: (message: string) => void): void {
  stdout(`Audited ${results.length} employees`);
  stdout(`OK: ${countByRisk(results, "OK")}`);
  stdout(`WARN: ${countByRisk(results, "WARN")}`);
  stdout(`BLOCKED: ${countByRisk(results, "BLOCKED")}`);
  stdout(`Report: ${outPath}`);
}

export async function runCli(
  argv: string[] = process.argv.slice(2),
  streams: CliStreams = {
    stdout: (message) => console.log(message),
    stderr: (message) => console.error(message)
  }
): Promise<number> {
  try {
    const options = parseArgs(argv);
    const employees = parseEmployees(await readJsonFile(options.employeesPath));
    const rules = parseRules(await readJsonFile(options.rulesPath));
    const results = auditEmployees(employees, rules);
    const csv = auditResultsToCsv(results);

    await mkdir(dirname(options.outPath), { recursive: true });
    await writeFile(options.outPath, csv, "utf8");
    printSummary(results, options.outPath, streams.stdout);

    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    streams.stderr(`Error: ${message}`);
    return 1;
  }
}
```

- [ ] **Step 4: Run CLI tests to verify they pass**

Run:

```bash
npm test
```

Expected: PASS for all tests.

- [ ] **Step 5: Run the sample audit command**

Run:

```bash
npm run audit
```

Expected:

```text
Audited 3 employees
OK: 1
WARN: 1
BLOCKED: 1
Report: reports/onboarding-audit.csv
```

- [ ] **Step 6: Inspect generated CSV**

Run:

```bash
sed -n '1,10p' reports/onboarding-audit.csv
```

Expected:

```text
employeeId,employeeName,employeeType,riskLevel,completionRate,missingDocuments
E001,李雷,full_time,OK,100%,
E002,韩梅梅,intern,WARN,80%,实习协议
E003,王五,contractor,BLOCKED,67%,银行卡; 个人信息登记表
```

- [ ] **Step 7: Commit CLI orchestration**

If this directory is a git repository, run:

```bash
git add src/cli.ts test/cli.test.ts reports/.gitkeep
git commit -m "feat: add audit cli"
```

If this directory is not a git repository, record: `Skipped commit: workspace is not a git repository.`

## Task 6: Final Verification and Review Prep

**Files:**
- Read: `docs/superpowers/specs/2026-05-02-hr-onboarding-auditor-design.md`
- Read: `docs/superpowers/plans/2026-05-02-hr-onboarding-auditor.md`
- Read: `src/*.ts`
- Read: `test/*.ts`

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
npm run audit
```

Expected:

- `npm test`: all tests pass.
- `npm run build`: TypeScript compiles without errors.
- `npm run audit`: prints the 3-employee summary and writes `reports/onboarding-audit.csv`.

- [ ] **Step 2: Confirm generated report contents**

Run:

```bash
sed -n '1,10p' reports/onboarding-audit.csv
```

Expected:

```text
employeeId,employeeName,employeeType,riskLevel,completionRate,missingDocuments
E001,李雷,full_time,OK,100%,
E002,韩梅梅,intern,WARN,80%,实习协议
E003,王五,contractor,BLOCKED,67%,银行卡; 个人信息登记表
```

- [ ] **Step 3: Review against spec**

Confirm each spec requirement is implemented:

- Local JSON inputs exist and are read by default.
- CLI supports `--employees`, `--rules`, and `--out`.
- Terminal summary prints audited count and `OK`, `WARN`, `BLOCKED` counts.
- CSV report has stable columns.
- Unknown employee type returns a clear error.
- Non-array `submittedDocuments` returns a clear validation error with employee id.
- Core logic is testable without filesystem access.

- [ ] **Step 4: Commit final verification notes if a notes file is created**

No notes file is required. If execution creates a short verification note, use this commit:

```bash
git add docs/superpowers/
git commit -m "docs: record onboarding auditor verification"
```

If this directory is not a git repository, record: `Skipped commit: workspace is not a git repository.`

## Self-Review

Spec coverage:

- Product scope is covered by Tasks 1, 3, 4, and 5.
- Data model is covered by Task 2.
- Business rules are covered by Task 3.
- Error handling is covered by Tasks 2 and 5.
- Testing strategy is covered by Tasks 2 through 6.
- Repository state is addressed in each commit step.

Placeholder scan:

- No placeholder tokens or incomplete task descriptions are intentionally left in this plan.

Type consistency:

- `Employee`, `Rules`, `RiskLevel`, and `AuditResult` are defined in `src/schema.ts`.
- `auditEmployees`, `auditResultsToCsv`, and `runCli` names are consistent across tests and implementation steps.
