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
- [x] Distinguish environment dependent builtins and allow overriding them with
  `registerEnvBuiltins()`
- [x] Handle simple `#define` and `#undef` preprocessing directives
- [x] Capture program properties using `#property`
- [x] Support conditional compilation directives (#ifdef, #ifndef, #else, #endif)
 - [x] Support parameterized macros in the preprocessor
- [x] Parse local variable declarations inside functions
 - [x] Execute local variables with `static` lifetime rules
- [x] Resolve input and extern variables via execution context
- [x] Implement pass-by-reference semantics when executing functions
- [x] Support loading and executing code split across multiple files
- [x] Create automated tests covering the lexer, parser and runtime
- [x] Document the interpreter architecture and usage examples
- [x] Execute functions via a specified entry point and manage an execution context
  - `callFunction()` helper performs argument checks and dispatches to builtins
- [x] Parse class methods, constructors, destructors and access modifiers
- [x] Parse control-flow statements (if/else, loops, switch)
- [x] Evaluate expressions using arithmetic, assignment, relational and
      boolean operators following MQL operator rules. A custom
      recursive-descent parser now honors operator precedence and
      distinguishes prefix from postfix forms like `--a` vs `a--`.
      Statement execution remains unimplemented. The `new` operator can
      instantiate classes via the runtime.
- [x] Enforce identifier rules from the MQL documentation:
      maximum length of 63 characters and disallow reserved words.
      Expand the lexer keyword list based on
      <https://docs.mql4.com/basis/syntax/reserved>.
- [x] Ensure comment syntax from
      <https://docs.mql4.com/basis/syntax/commentaries> continues
      to be tokenized correctly.
- [x] Execute control-flow statements via `executeStatements()` helper
      supporting `if`, `for`, `while`, `do..while`, `switch`,
      `break` and `continue`.
- [x] Integrate statement execution with parsed function bodies so user
      defined functions can run.
- [x] Parse `static` and `virtual` modifiers on class fields and methods.
 - [x] Implement object instantiation and inheritance through `instantiate()`
      and the `new`/`delete` operators. Polymorphic dispatch is still pending.
- [x] Support templates and class templates.
- [x] Support abstract classes and pure virtual methods.
- [x] Execute class and struct methods via `callMethod()`
- [x] Maintain global variable values in `runtime.globalValues`

# Upcoming Features

- [ ] Implement compile-time type checking to validate variable declarations, expressions and function calls.
  - [ ] Detect mismatched types in assignments and arguments.
  - [ ] Verify builtin functions are called with correct argument types and counts.
- [ ] Accumulate compile errors instead of throwing immediately.
  - [ ] Introduce a `CompilationError` interface with source location and message.
  - [ ] Have `compile()` return `errors` alongside `ast`, `runtime` and `properties`.
- [ ] Update the CLI to display the list of compilation errors and exit with a non-zero status when any are present.
- [ ] Expose error and type-checking results through the public library API so other tools can consume them.
- [ ] Add tests covering common error scenarios (undefined identifiers, invalid casts, incompatible types).
- [ ] Document the new error reporting workflow in the README with examples for both library and CLI usage.
