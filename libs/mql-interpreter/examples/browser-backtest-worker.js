import { BacktestRunner, parseCsv } from "../dist/index.js";

const PERIODS = {
  M1: 60,
  M5: 60 * 5,
  M15: 60 * 15,
  M30: 60 * 30,
  H1: 60 * 60,
};

const log = (message) => postMessage({ type: "log", message });

function aggregate(candles, tf) {
  if (!candles.length) return candles;
  const res = [];
  let start = Math.floor(candles[0].time / tf) * tf;
  let open = candles[0].open;
  let high = candles[0].high;
  let low = candles[0].low;
  let close = candles[0].close;
  let volume = candles[0].volume ?? 0;
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    if (c.time >= start + tf) {
      res.push({ time: start, open, high, low, close, volume });
      start = Math.floor(c.time / tf) * tf;
      open = c.open;
      high = c.high;
      low = c.low;
      close = c.close;
      volume = c.volume ?? 0;
    } else {
      if (c.high > high) high = c.high;
      if (c.low < low) low = c.low;
      close = c.close;
      volume += c.volume ?? 0;
    }
  }
  res.push({ time: start, open, high, low, close, volume });
  return res;
}

self.onmessage = async (e) => {
  const { mql, timeframe, params } = e.data;
  try {
    log("Fetching price data...");
    const csv = await fetch("./data/GBPUSD_M1.csv").then((r) => r.text());
    log("Parsing CSV...");
    let candles = parseCsv(csv);
    const tfSec = PERIODS[timeframe] ?? PERIODS.M1;
    if (tfSec !== PERIODS.M1) {
      log("Aggregating data...");
      candles = aggregate(candles, tfSec);
    }
    log("Running backtest...");
    const runner = new BacktestRunner(mql, candles, {
      log,
      inputValues: params,
      timeframe: tfSec,
    });
    runner.run();
    log("Backtest finished");
    const report = runner.getReport();
    postMessage({ type: "result", report });
  } catch (err) {
    log(`Error: ${err}`);
    postMessage({ type: "result", report: null });
  }
};
