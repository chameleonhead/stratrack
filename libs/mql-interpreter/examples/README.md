# mql-interpreter Examples

This directory demonstrates how to run the interpreter from the command line and how to verify indicator calculations against reference values.

## Setup

```bash
cd libs/mql-interpreter/examples
npm install
```

## Syntax Check

Verify that the sample compiles without errors:

```bash
npx mqli check "MACD Sample.mq4"
```

## CLI Backtest

Run the bundled MACD sample expert advisor on sample GBPUSD data using the published package:

```bash
npx mql-interpreter backtest "MACD Sample.mq4" data/GBPUSD_M1.csv
```

The command prints a JSON report containing global variables, account metrics and executed orders. By default the backtest runs with a 10,000\u00a0USD balance; adjust account settings using `--balance`, `--margin` and `--currency` if needed. Replace the CSV file with history exported from MetaTrader to backtest your own data.

The sample dataset uses the `date,time,open,high,low,close,volume` format where `date` is formatted as `YYYY.MM.DD` and `time` is formatted as `HH:MI`. To reproduce a live environment, export MetaTrader history in this format and place it under `examples/data/`.

## Browser Backtest

Serve this directory and then open `browser-backtest.html` to run a backtest directly in a browser. The Web Worker imports the interpreter from `node_modules`:

```bash
npx serve . # or python -m http.server
```

The page loads the MACD sample into a text area. Choose the EA's default timeframe (the worker always fetches the sample M1 GBPUSD data and aggregates it as needed), optionally enter `input` parameters as JSON, then click **Run Backtest** to send the code and settings to a Web Worker. The worker executes `BacktestRunner` asynchronously, streams log output (including `Print` statements) and finally displays the JSON report without blocking the UI.
