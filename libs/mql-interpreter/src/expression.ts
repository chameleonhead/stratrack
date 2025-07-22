export interface EvalEnv {
  [name: string]: any;
}

/**
 * Evaluate a simple MQL expression using JavaScript semantics.
 * Variables are taken from and written back to `env` so operations
 * like `+=` or `++` mutate the passed object.
 *
 * This helper does not yet support statements such as `if` or `for`
 * and does not implement the `new` or `delete` operators fully.
 */
export function evaluateExpression(expr: string, env: EvalEnv = {}): any {
  const fn = new Function('env', `with (env) { return (${expr}); }`);
  return fn(env);
}
