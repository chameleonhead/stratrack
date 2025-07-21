# MQL Interpreter

This package provides a basic framework for executing MQL4/5 code within Node.js.
It currently includes a simple lexer and parser. The parser recognizes
enumerations and basic class declarations with single inheritance. A minimal
runtime executes the AST and registers enums and classes.
It also provides a simple `cast()` helper for converting primitive values
between built-in types as described in the MQL documentation.

## Development

- `npm run build` – Compile TypeScript sources.

See [TODO.md](TODO.md) for planned features and tasks.

