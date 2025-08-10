# mql-interpreter Examples

This directory demonstrates how to run the interpreter from the command line and how to verify indicator calculations against reference values.

## Setup

```bash
cd libs/mql-interpreter
npm install
npm run build
```

## CLI Backtest

Run the bundled MACD sample expert advisor on sample GBPUSD data:

```bash
node bin/mql-interpreter.js "examples/MACD Sample.mq4" --backtest examples/data/GBPUSD_M1.csv
```

The command prints a JSON report containing global variables, account metrics and executed orders. By default the backtest runs with a 10,000&nbsp;USD balance; adjust account settings using `--balance`, `--margin` and `--currency` if needed. Replace the CSV file with history exported from MetaTrader to backtest your own data.

The sample dataset uses the `date,time,open,high,low,close,volume` format where `date` is formatted as `YYYY.MM.DD` and `time` is formatted as `HH:MI`. To reproduce a live environment, export MetaTrader history in this format and place it under `examples/data/`.

## Browser Backtest

After building the package you can run a backtest directly in a browser. Serve the `examples` directory and open `browser-backtest.html`:

```bash
npm run build
npx serve examples # or python -m http.server inside examples
```

The page loads the MACD sample into a text area. Choose the EA's default timeframe (the worker always fetches the sample M1 GBPUSD data and aggregates it as needed), optionally enter `input` parameters as JSON, then click **Run Backtest** to send the code and settings to a Web Worker. The worker executes `BacktestRunner` asynchronously, streams log output (including `Print` statements) and finally displays the JSON report without blocking the UI.
