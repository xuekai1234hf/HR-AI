import { runCli } from "./cli.js";

const exitCode = await runCli();
process.exitCode = exitCode;
