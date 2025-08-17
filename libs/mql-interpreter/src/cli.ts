#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { program } from "commander";
import { Parser } from "./parser/parser";
import { semanticCheck } from "./semantic/checker";
import { builtinSignatures } from "./libs/signatures";
import { BacktestRunner, parseCsv } from "./libs/backtestRunner";

program.name("mqli").description("MQL interpreter CLI").version("0.1.0");

program
  .command("check <file>")
  .description("コンパイルチェック")
  .action((file: string) => {
    console.log("Checking:", file);
    const code = readFileSync(file, "utf8");
    const ast = Parser.parse(code);
    const errors = semanticCheck(ast, builtinSignatures);
    if (errors.length > 0) {
      for (const e of errors) {
        console.error(`${e.line}:${e.column} ${e.message}`);
      }
      process.exit(1);
    }
    console.log("OK");
  });

program
  .command("backtest <file> <candles>")
  .description("バックテストを実行")
  .action((file: string, candles: string) => {
    const code = readFileSync(file, "utf8");
    const csv = readFileSync(candles, "utf8");
    const data = parseCsv(csv);
    const runner = new BacktestRunner(code, data);
    runner.run();
    console.log(JSON.stringify(runner.getReport(), null, 2));
  });

program.parse();
