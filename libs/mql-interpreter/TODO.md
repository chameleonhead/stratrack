# TODO for MQL Interpreter

The following tasks outline future work required to develop a functional MQL4/5 interpreter.

- [x] Implement a lexical analyzer to tokenize MQL source code
- [x] Build a parser that generates an AST from tokens
- [x] Design an execution engine capable of evaluating the AST
- [x] Provide a helper for primitive type casting
- [x] Map essential MQL built‑in functions (e.g. `OrderSend`, `iMA`) to JavaScript implementations
- [x] Parse dynamic array declarations
- [x] Parse top-level function declarations
- [x] Support function overloading when parsing and calling functions
- [x] Parse operator overloading as class/struct methods
- [x] Implement the `ArrayResize` helper for manipulating arrays
- [x] Provide a command‑line interface for running MQL scripts within Node.js
- [x] Implement the full set of builtin functions listed at
  <https://docs.mql4.com/function_indices>
- [x] Handle simple `#define` and `#undef` preprocessing directives
- [x] Capture program properties using `#property`
- [x] Support conditional compilation directives (#ifdef, #ifndef, #else, #endif)
- [ ] Support parameterized macros in the preprocessor
- [ ] Implement pass-by-reference semantics when executing functions
- [x] Support loading and executing code split across multiple files
- [x] Create automated tests covering the lexer, parser and runtime
- [ ] Document the interpreter architecture and usage examples
- [ ] Execute functions via a specified entry point and manage an execution context
  - `callFunction()` helper performs argument checks and dispatches to builtins
- [x] Parse class methods, constructors, destructors and access modifiers
- [ ] Parse control-flow statements (if/else, loops, switch)
