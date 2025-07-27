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
  console.error('Usage: mql-interpreter <file.mq4> [--backtest <data.csv>] [--data-dir <dir>] [--format html|json]');
  process.exit(1);
}

let backtestFile;
let dataDir;
let format = 'json';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--backtest') {
    backtestFile = args[i + 1];
    i++;
  } else if (args[i] === '--data-dir') {
    dataDir = args[i + 1];
    i++;
  } else if (args[i] === '--format') {
    format = args[i + 1];
    i++;
  } else if (args[i] === '--html') {
    format = 'html';
  } else if (args[i] === '--json') {
    format = 'json';
  }
}

const code = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

if (backtestFile) {
  const csv = fs.readFileSync(path.resolve(process.cwd(), backtestFile), 'utf8');
  const candles = parseCsv(csv);
  let storagePath;
  if (dataDir) {
    const dir = path.join(dataDir, 'MQL4', 'Files');
    fs.mkdirSync(dir, { recursive: true });
    storagePath = path.join(dir, 'globals.json');
  }
  const runner = new BacktestRunner(code, candles, { storagePath });
  runner.run();
  runner.getTerminal().flushGlobalVariables();
  const json = JSON.stringify(runner.getRuntime().globalValues, null, 2);
  if (format === 'html') {
    const escaped = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    console.log(`<!doctype html><html><body><pre>${escaped}</pre></body></html>`);
  } else {
    console.log(json);
  }
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
const out = JSON.stringify(runtime, null, 2);
if (format === 'html') {
  const escaped = out.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  console.log(`<!doctype html><html><body><pre>${escaped}</pre></body></html>`);
} else {
  console.log(out);
}
