import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { BacktestRunner } from "../dist/backtest.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csv = readFileSync(path.join(__dirname, "data", "EURUSD_M1.csv"), "utf8");
const candles = csv
  .trim()
  .split(/\r?\n/)
  .map((line) => {
    const [time, open, high, low, close, volume] = line.split(",").map(Number);
    return { time, open, high, low, close, volume };
  });

// Simple MQL code using iMA to compute a moving average on close prices
const source = `#property strict\ndouble ma;\nint OnInit(){return(INIT_SUCCEEDED);}\nvoid OnTick(){ma = iMA(NULL,0,5,0,MODE_SMA,PRICE_CLOSE,0);}`;
const runner = new BacktestRunner(source, candles);
runner.run();
const maFromInterpreter = runner.getRuntime().globalValues.ma;

function simpleMA(values, period) {
  const slice = values.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

const expected = simpleMA(
  candles.map((c) => c.close),
  5
);
console.log("MA from interpreter:", maFromInterpreter.toFixed(5));
console.log("Expected MA:", expected.toFixed(5));
console.log("Difference:", Math.abs(maFromInterpreter - expected));
