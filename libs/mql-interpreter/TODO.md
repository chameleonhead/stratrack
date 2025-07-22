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
- [x] Resolve input and extern variables across multiple files
- [x] Implement pass-by-reference semantics when executing functions
- [x] Support loading and executing code split across multiple files
- [x] Create automated tests covering the lexer, parser and runtime
- [x] Document the interpreter architecture and usage examples
- [x] Execute functions via a specified entry point and manage an execution context
  - `callFunction()` helper performs argument checks and dispatches to builtins
- [x] Parse class methods, constructors, destructors and access modifiers
- [x] Parse control-flow statements (if/else, loops, switch)
- [ ] Evaluate expressions using arithmetic, assignment, relational and
      boolean operators following MQL operator rules. This must honor
      the correct operator precedence and differentiate prefix/postfix
      forms like `--a` vs `a--`. `evaluateExpression()` currently uses
      JavaScript semantics and handles basic cases but does not yet
      support statements or the `new`/`delete` operators.
- [ ] Enforce identifier rules from the MQL documentation:
      maximum length of 63 characters and disallow reserved words.
      Expand the lexer keyword list based on
      <https://docs.mql4.com/basis/syntax/reserved>.
- [ ] Ensure comment syntax from
      <https://docs.mql4.com/basis/syntax/commentaries> continues
      to be tokenized correctly.
- [ ] Execute control-flow statements (`if`, `for`, `while`, `do..while`,
      `switch`) and implement `break`/`continue` behavior.
- [x] Parse `static` and `virtual` modifiers on class fields and methods.
- [ ] Implement object instantiation, inheritance and polymorphic dispatch.
- [ ] Support templates and class templates.
- [ ] Support abstract classes and pure virtual methods.
