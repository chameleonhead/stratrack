#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  interpret,
  compile,
  BacktestRunner,
  parseCsv,
} = require('../dist/index');

const args = process.argv.slice(2);
const file = args.shift();
if (!file) {
  console.error('Usage: mql-interpreter <file.mq4> [--backtest <data.csv>] [--data-dir <dir>]');
  process.exit(1);
}

let backtestFile;
let dataDir;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--backtest') {
    backtestFile = args[i + 1];
    i++;
  } else if (args[i] === '--data-dir') {
    dataDir = args[i + 1];
    i++;
  }
}

const code = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

if (backtestFile) {
  const csv = fs.readFileSync(path.resolve(process.cwd(), backtestFile), 'utf8');
  const candles = parseCsv(csv);
  const runner = new BacktestRunner(code, candles, { dataDir });
  runner.run();
  runner.getTerminal().flushGlobalVariables();
  console.log(JSON.stringify(runner.getRuntime().globalValues, null, 2));
  process.exit(0);
}

const compilation = compile(code, {
  fileProvider: (p) => {
    try {
      return fs.readFileSync(path.resolve(path.dirname(file), p), 'utf8');
    } catch {
      return undefined;
    }
  },
});
if (compilation.errors.length) {
  console.error('Compilation errors:');
  for (const e of compilation.errors) {
    console.error(`${e.line}:${e.column} ${e.message}`);
  }
  process.exit(1);
}
const runtime = interpret(code, undefined, {
  fileProvider: (p) => {
    try {
      return fs.readFileSync(path.resolve(path.dirname(file), p), 'utf8');
    } catch {
      return undefined;
    }
  },
});
console.log(JSON.stringify(runtime, null, 2));
