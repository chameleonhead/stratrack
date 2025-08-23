# MQL Interpreter

This package is a TypeScript-based framework for executing MQL4/5 code within Node.js. It ships with a lexer, parser, semantic checker, runtime and a growing set of built-in function stubs.
The parser understands enumerations along with class and struct declarations using single inheritance. Fields defined as `<type> <name>;` are recorded, including dynamic array declarations like `int values[];` with their dimensions.
Top-level functions are parsed with their return type, parameter list and default values, and multiple overloads may coexist under the same name. Class methods, constructors, destructors and operator overloads such as `operator+` are recognized. Members may be marked `static` or `virtual`, pure virtual methods (`=0`) are supported and classes can be prefixed with `abstract`.
Template classes and functions introduced by `template<typename T>` or `template<class U>` are also handled. Parameters prefixed with `&` are treated as references while arrays are always passed by reference; reference arguments must be objects (e.g. `{value: 10}`) so builtins like `StringTrimLeft` can mutate them. A `void` type is recognized for functions but cannot be used as a class field type. Only method signatures are stored; method bodies are ignored during execution, but the runtime captures all declarations so class layouts can be inspected.

## Usage

```ts
import { Parser } from "mql-interpreter/parser/parser";
import { semanticCheck } from "mql-interpreter/semantic/checker";
import { builtinSignatures } from "mql-interpreter/libs/signatures";
import { Runtime } from "mql-interpreter/runtime/runtime";
import { createLibs } from "mql-interpreter/libs";
import { InMemoryBroker, InMemoryAccount, InMemoryMarketData } from "mql-interpreter/libs/domain";

const broker = new InMemoryBroker();
const account = new InMemoryAccount();
const market = new InMemoryMarketData(marketData);

const ast = Parser.parse(source);
const errors = semanticCheck(ast, builtinSignatures);
if (errors.length === 0) {
  const runtime = new Runtime();
  const libs = createLibs({ broker, account, market });
  runtime.run(ast, { libs });
}
```

### Run an Expert Advisor

Use `BacktestRunner` to execute EA code against market data:

```ts
import { BacktestRunner } from "mql-interpreter";

const ea = `
int OnInit(){ return 0; }
void OnTick(){ /* trading logic */ }
`;

const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
const runner = new BacktestRunner(ea, candles);
runner.run();
```

### Use Indicators

Built-in indicators like `iMA` can be called from MQL code:

```ts
import { BacktestRunner } from "mql-interpreter";

const code = `
double ma;
void OnTick(){
  ma = iMA(NULL, 0, 14, 0, MODE_SMA, PRICE_CLOSE, 0);
}
`;

const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
const runner = new BacktestRunner(code, candles);
runner.step();
console.log(runner.getRuntime().globalValues.ma); // latest moving average
```

## Architecture

1. **Preprocessing** – source code is passed through the preprocessor which
   handles `#define`, conditional blocks, imports and properties. The result is a
   list of tokens.
2. **Parsing** – tokens are parsed into declarations such as enums, classes,
   functions and global variables.
3. **Compilation** – `execute()` registers the declarations in a runtime
   structure without running any user code.
4. **Execution** – `callFunction()` may then invoke an entry point using the
   populated runtime.

## Development

- `npm run build` – Compile TypeScript sources, including the CLI at `bin/mql-interpreter.ts`.
- `npm run build:browser` – Bundle the interpreter core into a browser-friendly file at `dist/index.browser.js`. Provide your own worker if needed.

See [TODO.md](TODO.md) for planned features and tasks.

## Backtesting

The library provides a small helper to replay historical market data. Use
`BacktestRunner` with a sequence of candles and your MQL source. The runner
exposes builtins such as `iOpen` and `iClose` so code can access bar data while
`step()` or `run()` executes the specified entry point for each candle. Series
helpers like `CopyOpen`, `CopyClose`, `CopyHigh`, `CopyLow`, `CopyTime`,
`CopyTickVolume` and `CopyRates` can copy ranges of values into arrays. Functions
like `Bars`, `iBars`, `iBarShift`, `iOpen`, `iHigh`, `iLow`, `iClose`, `iTime`
and `iVolume` report information about the available history. `SeriesInfoInteger`
returns series properties such as the number of loaded bars and `RefreshRates`
updates the latest tick values.
Standard indicators like `iMA`, `iMACD` and `iRSI` are available for basic analysis.
These indicators respect the symbol and timeframe arguments by retrieving price
series from the `MarketData` service, allowing backtests to query multiple
symbols or periods. Helpers like `IndicatorBuffers` and `SetIndexBuffer` are
available for future custom indicator support.
`Bid` and `Ask` variables are updated on every step. Orders placed through
`OrderSend` are routed to an internal `Broker`. The broker now supports market
and limit orders with optional stop loss and take profit levels. It advances
with each step so pending orders may be triggered and open trades closed
automatically. The runner manages a session composed of a test broker, account
and market data storage so each backtest is isolated. All executed orders can be
inspected after running and account metrics like balance and equity are
available via `runner.getAccountMetrics()`. The underlying broker, account and
market data instances are accessible with `runner.getBroker()`,
`runner.getAccount()` and `runner.getMarketData()` respectively. Market
information helpers such as `MarketInfo` query this in-memory data and only
return values for time ranges covered by the provided ticks.
Basic trading helpers are available as well. Use `OrdersTotal`,
`OrdersHistoryTotal`, `OrderSelect` and property functions like
`OrderType` or `OrderProfit` to inspect and close orders within a
backtest.
If you have raw tick data you can convert it to candles using
`ticksToCandles(ticks, timeframe)`. Each tick object should provide
`bid` and `ask` prices in addition to the timestamp:

```ts
const ticks = [
  { time: 0, bid: 1.0, ask: 1.1 },
  { time: 1, bid: 1.05, ask: 1.15 },
];
const candles = ticksToCandles(ticks, 60);
```

```ts
import { BacktestRunner } from "mql-interpreter";
const candles = [{ time: 1, open: 1, high: 1, low: 1, close: 1 }];
const runner = new BacktestRunner("int count; void OnTick(){count++;}", candles);
runner.run();
console.log(runner.getRuntime().globalValues.count); // 1
```

## Program structure and virtual terminal

BacktestRunner automatically calls `OnInit` before processing the first candle and invokes `OnDeinit` after the session ends. Timers can be scheduled with `EventSetTimer` or `EventSetMillisecondTimer` to invoke `OnTimer` at second or millisecond intervals; `EventKillTimer` cancels the schedule.
Trade operations like `OrderSend`, `OrderClose` or `OrderModify` trigger `OnTrade` so programs can react to order events.
Programs are classified as expert advisors, scripts, or indicators based on which handlers they implement (`OnTick`, `OnStart`, `OnCalculate`). The detected `programType` is exposed by `compile` and guides BacktestRunner's default entry point.
To simplify testing, a `VirtualTerminal` provides an in-memory file system. Helpers like `FileOpen`, `FileReadString` or `FileWriteString` can use this terminal without touching the host file system. The terminal implementation is encapsulated so it can later be replaced with real-time logic.
The terminal also stores global variables used by helpers such as `GlobalVariableSet` and exposes basic UI stubs like `Alert` and `PlaySound`. Chart and window operations are currently no-ops in the backtest implementation but can be swapped out when running against a real terminal.
Global variables are kept across sessions when a storage path is provided to `VirtualTerminal`. The `GlobalVariablesFlush` builtin writes them to disk and values expire after four weeks without access.
Additional helpers like `Symbol`, `Period`, `IsTesting` and `TerminalInfoInteger` report the current environment state during backtests.
