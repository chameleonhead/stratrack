#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { program } from "commander";
import { Parser } from "./parser/parser";
import { semanticCheck } from "./semantic/checker";
import { builtinSignatures } from "./libs/signatures";
import { BacktestRunner, parseCsv } from "./libs/backtestRunner";
import { InMemoryIndicatorSource } from "./libs/indicatorSource";

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
  .command("backtest <file> [candles]")
  .description("バックテストを実行")
  .option("--candles <csv>", "ローソク足のCSVファイル")
  .option("--balance <balance>", "初期残高", (v) => Number(v))
  .option("--margin <margin>", "初期証拠金", (v) => Number(v))
  .option("--currency <code>", "口座通貨")
  .option("--timeframe <seconds>", "デフォルト時間足", (v) => Number(v))
  .option(
    "--indicator <file>",
    "カスタムインジケータファイル",
    (v: string, p: string[]) => {
      p.push(v);
      return p;
    },
    [] as string[]
  )
  .action((file: string, candles: string | undefined, opts: any) => {
    const csvFile = candles ?? opts.candles;
    if (!csvFile) {
      console.error("ローソク足のCSVファイルを指定してください");
      process.exit(1);
    }
    const code = readFileSync(file, "utf8");
    const csv = readFileSync(csvFile, "utf8");
    const data = parseCsv(csv);
    const indicatorSource = new InMemoryIndicatorSource();
    for (const ind of opts.indicator as string[]) {
      const name = basename(ind, extname(ind));
      indicatorSource.set(name, readFileSync(ind, "utf8"));
    }
    const runner = new BacktestRunner(code, data, {
      initialBalance: opts.balance,
      initialMargin: opts.margin,
      accountCurrency: opts.currency,
      timeframe: opts.timeframe,
      indicatorSource,
    });
    runner.run();
    console.log(JSON.stringify(runner.getReport(), null, 2));
  });

program.parse();
