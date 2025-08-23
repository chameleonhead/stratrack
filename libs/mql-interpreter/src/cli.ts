#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { program } from "commander";
import { Parser } from "./parser/parser";
import { semanticCheck } from "./semantic/checker";
import { builtinSignatures } from "./libs/signatures";
import { BacktestRunner, parseCsv } from "./backtestRunner";
import { InMemoryIndicatorEngine } from "./libs/domain/indicator";

export function readTextFile(file: string): string {
  const buf = readFileSync(file);
  if (buf.length >= 2) {
    const b0 = buf[0];
    const b1 = buf[1];
    if (b0 === 0xff && b1 === 0xfe) {
      return buf.toString("utf16le", 2);
    }
    if (b0 === 0xfe && b1 === 0xff) {
      return buf.subarray(2).swap16().toString("utf16le");
    }
    if (buf.length >= 3 && b0 === 0xef && b1 === 0xbb && buf[2] === 0xbf) {
      return buf.toString("utf8", 3);
    }
  }
  return buf.toString("utf8");
}

program.name("mqli").description("MQL interpreter CLI").version("0.1.0");

program
  .command("check <file>")
  .description("コンパイルチェック")
  .action((file: string) => {
    console.log("Checking:", file);
    const code = readTextFile(file);
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
    const code = readTextFile(file);
    const csv = readTextFile(csvFile);
    const data = parseCsv(csv);
    const indicatorEngine = new InMemoryIndicatorEngine();
    for (const ind of opts.indicator as string[]) {
      const name = basename(ind, extname(ind));
      indicatorEngine.set(name, readTextFile(ind));
    }
    const runner = new BacktestRunner(code, data, {
      initialBalance: opts.balance,
      initialMargin: opts.margin,
      accountCurrency: opts.currency,
      timeframe: opts.timeframe,
      indicatorEngine,
    });
    runner.run();
    console.log(JSON.stringify(runner.getReport(), null, 2));
  });

const isDirectRun =
  typeof require !== "undefined" && typeof module !== "undefined" ? require.main === module : true;

if (isDirectRun) {
  program.parse();
}
