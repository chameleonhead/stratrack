# mql-interpreter Examples

This directory demonstrates how to run the interpreter from the command line and how to verify indicator calculations against reference values.

## Setup

```bash
cd libs/mql-interpreter
npm install
npm run build
```

## CLI Backtest

Run the bundled MACD sample expert advisor on sample EURUSD data:

```bash
node bin/mql-interpreter.js examples/macd-sample.mq4 --backtest examples/data/EURUSD_M1.csv
```

The command prints a JSON report containing global variables, account metrics and executed orders. Replace the CSV file with history exported from MetaTrader to backtest your own data.

## Indicator Verification

`compare-indicator.js` replays the same data and checks that the interpreter's `iMA` output matches a simple moving average computed in JavaScript.

```bash
node examples/compare-indicator.js
```

The sample dataset uses the `time,open,high,low,close,volume` format where `time` is a Unix timestamp in seconds. To reproduce a live environment, export MetaTrader history in this format and place it under `examples/data/`.
