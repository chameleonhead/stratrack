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
The runtime executes the AST and registers enums, classes, functions and global
variables. `execute()` can optionally invoke an entry point function after
setup. Provide the name and arguments via `{ entryPoint, args }` and the
function (or builtin) will be executed using `callFunction()`. Function bodies
are not interpreted yet so only builtins will execute.
You may also invoke any parsed function manually using `callFunction()`, which
checks arguments against the stored signatures and dispatches to a builtin
implementation if one exists.
For example:

```ts
interpret('', { entryPoint: 'Print', args: ['Hello'] });
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
identifiers will cause lexing to fail.  In addition, reserved words such as
`for` or `typename` are recognized as keywords and cannot be used as
identifiers.

Utility helpers include `ArrayResize()` to change the length of dynamic
arrays and a comprehensive set of builtin function stubs. Besides
`Print`, `OrderSend` and `iMA`, all functions listed at
<https://docs.mql4.com/function_indices> are available as no-ops and can
be accessed through `getBuiltin()`.  A few helpers such as `ArrayResize`
and `StringTrimLeft` have working implementations.

Builtins fall into two categories. **Core** builtins are environment
independent and always behave the same (e.g. `ArrayResize` or `Print`).
Others like `iMA` or `AccountBalance` depend on trading platform data and
default to no-ops.  Host applications may provide real implementations by
calling `registerEnvBuiltins()` before executing code.

To create an instance of a parsed class, use `instantiate()` with the runtime
and class name. Inherited fields are included in the resulting object:

```ts
const runtime = interpret('class P{int a;} class C:P{double b;}');
const obj = instantiate(runtime, 'C');
// obj has properties a and b
```

`evaluateExpression()` understands the `new` operator when passed the runtime,
and also supports the `delete` operator to free a variable. These allow small
object constructions and destructions inside expressions:

```ts
const obj = evaluateExpression('new C', {}, runtime);
evaluateExpression('delete obj', { obj }, runtime);
```

Global variables declared at the top level are parsed as well. Qualifiers
like `static`, `input` and `extern` are recorded along with optional
initial values and any array dimensions. The runtime exposes these under
`runtime.variables` for later inspection.
Function bodies are scanned for local variable declarations, which are stored
with each function. Control-flow statements such as `if`, `for` and `switch`
are recognized and kept as placeholder nodes. Static local variables are
initialized the first time a function is called and preserved across
subsequent calls. Their values are stored in `runtime.staticLocals`.

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

The preprocessor also supports a simplified `#import "file"` directive.  Files
must be provided via a `fileProvider` callback passed to `preprocess` or
`interpret`.  This keeps the interpreter free of Node.js dependencies so the
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

## Architecture

1. **Preprocessing** – source code is passed through the preprocessor which
   handles `#define`, conditional blocks, imports and properties. The result is a
   list of tokens.
2. **Parsing** – tokens are parsed into declarations such as enums, classes,
   functions and global variables.
3. **Execution** – `execute()` registers the parsed declarations in a runtime
   structure. If an entry point is provided, `callFunction()` invokes it.

## Development

- `npm run build` – Compile TypeScript sources.

See [TODO.md](TODO.md) for planned features and tasks.

