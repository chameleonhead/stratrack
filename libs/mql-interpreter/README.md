# MQL Interpreter

This package provides a basic framework for executing MQL4/5 code within Node.js.
It currently includes a simple lexer and parser. The parser recognizes
enumerations and class declarations with single inheritance. Class fields
declared as `<type> <name>;` are captured, including simple dynamic array
declarations like `int values[];`. These fields are stored in the runtime
with their array dimensions.
A minimal runtime executes the AST and registers enums and classes.
It also provides a simple `cast()` helper for converting primitive values
between built-in types as described in the MQL documentation.

## Development

- `npm run build` – Compile TypeScript sources.

See [TODO.md](TODO.md) for planned features and tasks.

