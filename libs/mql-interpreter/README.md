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
can choose the one matching the argument count. MQL defines operator
overloading for class or struct methods, but method parsing has not yet been
implemented in this interpreter. Support for operator overloads will be added
when class methods are parsed.
A parameter can be prefixed with `&` to indicate it is passed by reference.
Arrays are always treated as references. The runtime stores this information for
each parameter.
A `void` type is recognized as a keyword for functions but cannot be used
as a class field type.
The runtime executes the AST and registers enums and classes. `execute()` accepts
an optional entry point name for future use when function execution is
implemented. Functions can be invoked manually using `callFunction()` which
checks arguments against the parsed signature and then dispatches to a builtin
implementation if one exists.
It also provides a simple `cast()` helper for converting primitive values
between built-in types as described in the MQL documentation. The lexer
recognizes many control‑flow keywords from MQL/C++, such as `for`, `while`,
`switch` and more.

Utility helpers include `ArrayResize()` to change the length of dynamic
arrays and a comprehensive set of builtin function stubs. Besides
`Print`, `OrderSend` and `iMA`, all functions listed at
<https://docs.mql4.com/function_indices> are available as no-ops and can
be accessed through `getBuiltin()`.

The preprocessor handles simple `#define` and `#undef` directives. Only
parameterless constants are expanded during lexing, allowing code like

```mql
#define SIZE 10
class A { int arr[SIZE]; }
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

## Development

- `npm run build` – Compile TypeScript sources.

See [TODO.md](TODO.md) for planned features and tasks.

