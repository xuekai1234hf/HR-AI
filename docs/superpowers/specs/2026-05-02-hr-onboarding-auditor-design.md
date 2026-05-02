# HR Onboarding Auditor Design

Date: 2026-05-02

## Purpose

`hr-onboarding-auditor` is a small TypeScript CLI project for learning the Superpowers workflow end to end. It implements a focused slice of the HR-AI product idea: checking whether onboarding employee files are complete.

The demo should be small enough to finish in one learning session, but real enough to exercise design, planning, test-driven development, debugging, verification, and review.

## Product Scope

The CLI reads employee onboarding records and document rules from local JSON files, audits each employee, prints a terminal summary, and writes a CSV report.

Inputs:

- `data/employees.json`: employee records, including employee type, start date, and submitted documents.
- `data/rules.json`: shared required documents and employee-type-specific required documents.

Outputs:

- Terminal summary with each employee's completion status, missing documents, and risk level.
- `reports/onboarding-audit.csv` with stable columns suitable for HR review.

## Non-Goals

This project will not:

- Call any AI model or remote API.
- Build a web UI.
- Use a database.
- Perform legal or labor-dispute judgment.
- Delete, reset, or overwrite unrelated project files.

All generated output stays inside the current project directory. The primary generated file is `reports/onboarding-audit.csv`.

## User Experience

The intended command is:

```bash
npm run audit
```

The default command reads:

- `data/employees.json`
- `data/rules.json`

and writes:

- `reports/onboarding-audit.csv`

The CLI should also support explicit paths:

```bash
npm run audit -- --employees data/employees.json --rules data/rules.json --out reports/onboarding-audit.csv
```

On success, the CLI prints a compact summary:

```text
Audited 3 employees
OK: 1
WARN: 1
BLOCKED: 1
Report: reports/onboarding-audit.csv
```

On invalid input, the CLI exits with a non-zero status and prints a clear error message.

## Data Model

Employee record:

```ts
type Employee = {
  id: string;
  name: string;
  type: string;
  startDate: string;
  submittedDocuments: string[];
};
```

Rules:

```ts
type Rules = {
  commonRequiredDocuments: string[];
  typeRequiredDocuments: Record<string, string[]>;
};
```

Audit result:

```ts
type RiskLevel = "OK" | "WARN" | "BLOCKED";

type AuditResult = {
  employeeId: string;
  employeeName: string;
  employeeType: string;
  missingDocuments: string[];
  completionRate: number;
  riskLevel: RiskLevel;
};
```

## Business Rules

For each employee:

1. Required documents are the union of `commonRequiredDocuments` and documents listed for the employee's `type`.
2. Duplicate required documents are checked only once.
3. Submitted documents match by exact string.
4. Unknown employee types are validation errors.
5. Completion rate is submitted required documents divided by total required documents.
6. Risk level is:
   - `OK`: no missing documents.
   - `WARN`: one missing document.
   - `BLOCKED`: two or more missing documents.

## Architecture

Planned structure:

```text
hr-onboarding-auditor/
  package.json
  tsconfig.json
  src/
    index.ts
    cli.ts
    auditor.ts
    csv.ts
    schema.ts
  test/
    auditor.test.ts
    csv.test.ts
    cli.test.ts
  data/
    employees.json
    rules.json
  reports/
    .gitkeep
```

Module responsibilities:

- `schema.ts`: defines TypeScript types and validates parsed JSON shape.
- `auditor.ts`: contains pure audit logic with no filesystem access.
- `csv.ts`: converts audit results to CSV with stable column order and escaping.
- `cli.ts`: parses CLI options, reads input files, writes the report, and prints summaries.
- `index.ts`: executable entrypoint.

The core business logic lives in pure functions so it can be tested without touching the filesystem.

## Error Handling

The CLI should handle:

- Missing input files.
- Invalid JSON.
- Missing required top-level fields.
- Unknown employee type.
- Non-array `submittedDocuments`.
- Output path write failure.

Validation errors should name the problem and, when possible, the affected employee id.

## Testing Strategy

Tests should cover:

- Full-time employee common and type-specific document requirements.
- Intern-specific requirements.
- Risk level calculation for `OK`, `WARN`, and `BLOCKED`.
- Duplicate required documents.
- Unknown employee type validation.
- CSV column order.
- CSV escaping for commas and quotes.
- CLI happy path using sample files and a temporary output path.

The minimum verification commands are:

```bash
npm test
npm run build
npm run audit
```

## Superpowers Learning Path

This project is designed to exercise these Superpowers skills:

1. `brainstorming`: clarify scope and produce this design.
2. `writing-plans`: turn the design into a step-by-step implementation plan.
3. `test-driven-development`: write failing tests before implementation.
4. `systematic-debugging`: investigate at least one real failure, such as CSV escaping or unknown employee type validation.
5. `verification-before-completion`: run tests, build, and a sample audit command before claiming completion.
6. `requesting-code-review`: review the completed branch for correctness, risk, and missing tests.

## Repository State

At design time, `/Users/xk/work/codex/HR-AI` is not a git repository. The design document is written locally, but committing it requires explicit user approval to initialize git or use another repository strategy.
