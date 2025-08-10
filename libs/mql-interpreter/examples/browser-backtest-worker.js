import { BacktestRunner, parseCsv } from "../dist/index.js";

const log = (message) => postMessage({ type: "log", message });

self.onmessage = async (e) => {
  const { mql, timeframe, params } = e.data;
  try {
    log("Fetching price data...");
    const csv = await fetch(`./data/GBPUSD_${timeframe}.csv`).then((r) => r.text());
    log("Parsing CSV...");
    const candles = parseCsv(csv);
    log("Running backtest...");
    const runner = new BacktestRunner(mql, candles, {
      log,
      inputValues: params,
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
