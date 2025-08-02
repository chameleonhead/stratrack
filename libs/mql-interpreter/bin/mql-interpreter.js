#!/usr/bin/env node
import { readFileSync, mkdirSync } from "fs";
import { resolve, join, dirname } from "path";
import { interpret, compile, BacktestRunner, parseCsv, getWarningCodes } from "../dist/index.js";

const args = process.argv.slice(2);
if (args.includes("--list-warnings")) {
  for (const code of getWarningCodes()) {
    console.log(code);
  }
  process.exit(0);
}
const file = args.shift();
if (!file) {
  console.error(
    "Usage: mql-interpreter <file.mq4> [--backtest <data.csv>] [--data <data.csv>] [--data-dir <dir>] [--balance <amount>] [--margin <amount>] [--currency <code>] [--format html|json] [--warnings-as-errors] [--suppress-warning <code>] [--list-warnings]"
  );
  process.exit(1);
}

let backtestFile;
let dataDir;
let format = "json";
let initialBalance;
let initialMargin;
let accountCurrency;
let warningsAsErrors = false;
const suppressWarnings = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--backtest" || args[i] === "--data") {
    backtestFile = args[i + 1];
    i++;
  } else if (args[i] === "--data-dir") {
    dataDir = args[i + 1];
    i++;
  } else if (args[i] === "--format") {
    format = args[i + 1];
    i++;
  } else if (args[i] === "--html") {
    format = "html";
  } else if (args[i] === "--json") {
    format = "json";
  } else if (args[i] === "--balance") {
    initialBalance = Number(args[i + 1]);
    i++;
  } else if (args[i] === "--margin") {
    initialMargin = Number(args[i + 1]);
    i++;
  } else if (args[i] === "--currency") {
    accountCurrency = args[i + 1];
    i++;
  } else if (args[i] === "--warnings-as-errors") {
    warningsAsErrors = true;
  } else if (args[i] === "--suppress-warning") {
    suppressWarnings.push(args[i + 1]);
    i++;
  }
}

const code = readFileSync(resolve(process.cwd(), file), "utf8");

if (backtestFile) {
  const csv = readFileSync(resolve(process.cwd(), backtestFile), "utf8");
  const candles = parseCsv(csv);
  let storagePath;
  if (dataDir) {
    const dir = join(dataDir, "MQL4", "Files");
    mkdirSync(dir, { recursive: true });
    storagePath = join(dir, "globals.json");
  }
  const runner = new BacktestRunner(code, candles, {
    storagePath,
    initialBalance,
    initialMargin,
    accountCurrency,
  });
  runner.run();
  runner.getTerminal().flushGlobalVariables();
  const report = runner.getReport();
  const json = JSON.stringify(report, null, 2);
  if (format === "html") {
    const escaped = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    console.log(`<!doctype html><html><body><pre>${escaped}</pre></body></html>`);
  } else {
    console.log(json);
  }
  process.exit(0);
}

const compilation = compile(code, {
  fileProvider: (p) => {
    try {
      return readFileSync(resolve(dirname(file), p), "utf8");
    } catch {
      return undefined;
    }
  },
  warningsAsErrors,
  suppressWarnings,
});
if (compilation.warnings.length) {
  console.error("Compilation warnings:");
  for (const w of compilation.warnings) {
    const code = w.code ? ` [${w.code}]` : "";
    console.error(`${w.line}:${w.column} ${w.message}${code}`);
  }
}
const realErrors = compilation.errors.filter((e) => !compilation.warnings.includes(e));
if (realErrors.length) {
  console.error("Compilation errors:");
  for (const e of realErrors) {
    console.error(`${e.line}:${e.column} ${e.message}`);
  }
}
if (compilation.errors.length) {
  process.exit(1);
}
const runtime = interpret(code, undefined, {
  fileProvider: (p) => {
    try {
      return readFileSync(resolve(dirname(file), p), "utf8");
    } catch {
      return undefined;
    }
  },
  warningsAsErrors,
  suppressWarnings,
});
const out = JSON.stringify(runtime, null, 2);
if (format === "html") {
  const escaped = out.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  console.log(`<!doctype html><html><body><pre>${escaped}</pre></body></html>`);
} else {
  console.log(out);
}
