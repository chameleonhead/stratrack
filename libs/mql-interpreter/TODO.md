# TODO for MQL Interpreter

The following tasks outline future work required to develop a functional MQL4/5 interpreter.

- [x] Implement a lexical analyzer to tokenize MQL source code
- [x] Build a parser that generates an AST from tokens
- [x] Design an execution engine capable of evaluating the AST
- [x] Provide a helper for primitive type casting
- [ ] Map essential MQL built‑in functions (e.g. `OrderSend`, `iMA`) to JavaScript implementations
- [ ] Provide a command‑line interface for running MQL scripts within Node.js
- [ ] Support loading and executing code split across multiple files
- [ ] Create automated tests covering the lexer, parser and runtime
- [ ] Document the interpreter architecture and usage examples
- [ ] Parse class methods, constructors, destructors and access modifiers
