# MQL Interpreter

This package provides a basic framework for executing MQL4/5 code within Node.js.
It currently includes a simple lexer and parser. The parser recognizes
enumerations, class and struct declarations with single inheritance. Class fields
declared as `<type> <name>;` are captured, including simple dynamic array
declarations like `int values[];`. These fields are stored in the runtime
with their array dimensions. Top-level functions are also parsed. Their return
type, name and parameter list (including any default values) are recorded in the
runtime for inspection.
A single name may have multiple declarations with different parameter lists,
mirroring MQL's function overloading rules. The runtime stores every overload
A function may be overloaded with different parameter lists so `callFunction()`
can choose the one matching the argument count. The parser also captures class
methods, including constructors, destructors and operator overloads like
`operator+`. Only the method signatures are stored; method bodies are ignored
during execution.
Fields and methods may be marked `static`, and methods may be marked
`virtual`. Pure virtual methods using `=0` are recognized, and classes may be
prefixed with `abstract`. These attributes are captured and appear in the
runtime so you can inspect class layouts.
Template classes and functions are also recognized when preceded by
`template<typename T>` or `template<class U>` declarations. The list of
template parameter names is stored alongside the class or function.
A parameter can be prefixed with `&` to indicate it is passed by reference.
Arrays are always treated as references. The runtime stores this information for
each parameter.
A reference argument must be an object, e.g. `{value: 10}`. Builtins like
`StringTrimLeft` will mutate the passed object.
A `void` type is recognized as a keyword for functions but cannot be used
as a class field type.
The interpreter can compile code without running it using `compile(source)`.
This preprocesses and parses the code, returning a `runtime` object populated
with enums, classes, functions and global variable declarations along with
separate `errors` and `warnings` arrays describing any diagnostics. Variables
declared with `input` or `extern` appear in `runtime.variables` so a host can
ask the user for their values before execution. After providing values in
`inputValues` and `externValues`, call `interpret()` to run an entry point or
invoke `callFunction()` directly. Parsed function bodies run via
`executeStatements`.

For example:

```ts
const { runtime } = compile("input int Period=10; void start(){ Print(Period); }");
// Prompt user and set value
runtime.globalValues.Period = 5;
callFunction(runtime, "start");
```

It also provides a simple `cast()` helper for converting primitive values
between built-in types as described in the MQL documentation. The lexer
recognizes many control‑flow keywords from MQL/C++, such as `for`, `while`,
`switch` and more. Most arithmetic, assignment, relational and bitwise
operators (e.g. `+=`, `<<`, `&&`) are tokenized as `Operator` tokens so the
parser can handle expressions in the future.
Simple expression evaluation is provided via `evaluateExpression()`. It
implements a small recursive‑descent parser that follows the MQL operator
precedence and correctly distinguishes prefix from postfix forms such as
`--a` and `a--`.

The lexer skips `//` single line comments and `/* ... */` blocks entirely so
they do not appear in the token stream. Single line comments may appear
inside block comments, while `/*` inside a block does not start a nested
comment. Unterminated comments cause lexing to fail. Identifiers may contain
letters, digits and underscores and must not exceed 63 characters; longer
identifiers will cause lexing to fail. In addition, reserved words such as
`for` or `typename` are recognized as keywords and cannot be used as
identifiers.

Utility helpers include `ArrayResize()` to change the length of dynamic
arrays and a comprehensive set of builtin function stubs. Besides
`Print`, `OrderSend` and indicator helpers like `iMA`, `iMACD` and `iRSI`, all functions listed at
<https://docs.mql4.com/function_indices> are available as no-ops and can
be accessed through `getBuiltin()`. A few helpers such as `ArrayResize`,
`ArraySort`, `GetTickCount64` and `PlaySound` have working implementations
alongside string, math and global variable helpers such as `GlobalVariableSet`.

Builtins fall into two categories. **Core** builtins are environment
independent and always behave the same (e.g. `ArrayResize` or `Print`).
Others like `iMA`, `iMACD`, `iRSI` or `AccountBalance` depend on trading platform data and
default to no-ops. Host applications may provide real implementations by
calling `registerEnvBuiltins()` before executing code.

Global variable helpers described at
<https://docs.mql4.com/globals> are included. Use functions such as
`GlobalVariableSet`, `GlobalVariableGet` and `GlobalVariablesTotal` to
share values across scripts while the interpreter runs. These variables are
kept in memory and may be flushed with `GlobalVariablesFlush` when a
persistent store is added.

To create an instance of a parsed class, use `instantiate()` with the runtime
and class name. Inherited fields are included in the resulting object:

```ts
const runtime = interpret("class P{int a;} class C:P{double b;}");
const obj = instantiate(runtime, "C");
// obj has properties a and b
```

Methods declared inside classes and structs are stored with their bodies so they
can be executed at runtime. Use `callMethod()` with the runtime, class name,
method name and object instance:

```ts
class C{ int v; void inc(){ v++; }}
const rt = interpret('class C{ int v; void inc(){ v++; } }');
const c = instantiate(rt, 'C');
callMethod(rt, 'C', 'inc', c);
// c.v === 1
```

`evaluateExpression()` understands the `new` operator when passed the runtime,
and also supports the `delete` operator to free a variable. These allow small
object constructions and destructions inside expressions:

```ts
const obj = evaluateExpression("new C", {}, runtime);
evaluateExpression("delete obj", { obj }, runtime);
```

A companion helper `executeStatements()` can interpret a small subset of MQL
control flow including `if`, `for`, `while`, `do...while`, `switch`, `break`
and `continue`. It executes statements against a plain object environment using
`evaluateExpression` for the expressions:

```ts
const env: any = { sum: 0, i: 0 };
executeStatements("for(i=0;i<3;i++){ if(i==1) continue; sum+=i; }", env);
// env.sum === 3
```

Global variables declared at the top level are parsed as well. Qualifiers
like `static`, `input` and `extern` are recorded along with optional
initial values and any array dimensions. The runtime exposes these under
`runtime.variables` for later inspection. Their current values are stored in
`runtime.globalValues` and are modified when functions update them.
Locals with the same name temporarily shadow globals but do not overwrite their
stored values.
Function bodies are scanned for local variable declarations and the raw
statement text is saved. `callFunction()` executes this body using
`executeStatements`, which currently understands `if`, loops, `switch`,
`break`, `continue` and `return`. Static local variables are initialized on the
first call and their values stored in `runtime.staticLocals`.

The preprocessor handles `#define` and `#undef` directives. Both simple
constants and parameterized macros are expanded during lexing, allowing code like

```mql
#define SIZE 10
class A { int arr[SIZE]; }

#define SQR(x) ((x)*(x))
int v = SQR(2);
```

to be parsed correctly.

Conditional compilation directives `#ifdef`, `#ifndef`, `#else` and `#endif`
are also recognized. Code within inactive branches is skipped entirely during
preprocessing, so you can enable or disable sections based on defined macros.

`#property` directives are recognized as well. Use `preprocessWithProperties`
to collect program properties before parsing. When using `interpret()`, the
collected properties are returned in `runtime.properties`.

The preprocessor also supports a simplified `#import "file"` directive. Files
must be provided via a `fileProvider` callback passed to `preprocess` or
`interpret`. This keeps the interpreter free of Node.js dependencies so the
same logic works in the browser.

```ts
preprocess('#import "lib.mqh"\n#import', {
  fileProvider: (name) => libraries[name],
});
```

After running `npm run build` you can use the `mql-interpreter` CLI to execute a
file and print the resulting runtime information:

```bash
npx mql-interpreter path/to/file.mq4
```

The CLI performs compilation first. Any warnings are printed but do not halt
execution by default. Pass `--warnings-as-errors` to exit when warnings are
present. If syntax or type errors are detected they are printed and the process
exits with a non-zero status. When syntax errors occur, type checking is skipped
to avoid redundant messages:

```bash
npx mql-interpreter bad.mq4
1:1 Unknown type Foo
```

To run a quick backtest, supply the `--backtest` option with candle data in CSV
format. Optionally set `--data-dir` to mimic the MT4 data folder so global
variables persist between runs. Results now include account metrics and the
executed order list in addition to globals. Output is JSON by default or an
HTML snippet when `--format html` is provided:

```bash
npx mql-interpreter test.mq4 --backtest candles.csv --data-dir ./tmp --format html > report.html
```

## Architecture

1. **Preprocessing** – source code is passed through the preprocessor which
   handles `#define`, conditional blocks, imports and properties. The result is a
   list of tokens.
2. **Parsing** – tokens are parsed into declarations such as enums, classes,
   functions and global variables.
3. **Compilation** – `execute()` registers the declarations in a runtime
   structure without running any user code.
4. **Execution** – `callFunction()` or `interpret()` may then invoke an entry
   point using the populated runtime.

## Development

- `npm run build` – Compile TypeScript sources.

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

BacktestRunner automatically calls `OnInit` before processing the first candle and invokes `OnDeinit` after the session ends.
To simplify testing, a `VirtualTerminal` provides an in-memory file system. Helpers like `FileOpen` or `FileReadString` can use this terminal without touching the host file system. The terminal implementation is encapsulated so it can later be replaced with real-time logic.
The terminal also stores global variables used by helpers such as `GlobalVariableSet` and exposes basic UI stubs like `Alert` and `PlaySound`. Chart and window operations are currently no-ops in the backtest implementation but can be swapped out when running against a real terminal.
Global variables are kept across sessions when a storage path is provided to `VirtualTerminal`. The `GlobalVariablesFlush` builtin writes them to disk and values expire after four weeks without access.
Additional helpers like `Symbol`, `Period`, `IsTesting` and `TerminalInfoInteger` report the current environment state during backtests.
