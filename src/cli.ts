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
