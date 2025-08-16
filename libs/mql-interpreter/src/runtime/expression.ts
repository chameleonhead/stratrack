export interface EvalEnv {
  [name: string]: any;
}

import { lex, Token, TokenType } from "../compiler/lexer.js";
import { cast } from "./casting.js";
import { DateTimeValue } from "./datetimeValue.js";

interface EvalResult {
  value: any;
  ref?: string;
}

// Operators for assignment
const assignmentOps = new Set(["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="]);

import type { Runtime } from "./types.js";
import { instantiate, callFunction } from "./runtime.js";

export function evaluateExpression(expr: string, env: EvalEnv = {}, runtime?: Runtime): any {
  const { tokens, errors } = lex(expr);
  if (errors.length) {
    throw new Error(errors.map((e) => e.message).join("\n"));
  }
  let pos = 0;

  const peek = () => tokens[pos];
  const atEnd = () => pos >= tokens.length;
  const consume = (type?: TokenType, value?: string): Token => {
    const t = tokens[pos];
    if (!t) throw new Error("Unexpected end of expression");
    if (type && t.type !== type) throw new Error(`Expected ${type} but got ${t.type}`);
    if (value && t.value !== value) throw new Error(`Expected ${value} but got ${t.value}`);
    pos++;
    return t;
  };

  function parsePrimary(): EvalResult {
    const t = peek();
    if (!t) throw new Error("Unexpected end");
    if (t.type === TokenType.Number) {
      consume();
      return { value: Number(t.value) };
    }
    if (t.type === TokenType.String) {
      consume();
      return { value: t.value };
    }
    if (t.type === TokenType.Keyword && (t.value === "true" || t.value === "false")) {
      consume();
      return { value: t.value === "true" ? 1 : 0 };
    }
    if (t.type === TokenType.Identifier) {
      consume();
      const name = t.value;
      if (!atEnd() && peek().value === "(") {
        if (!runtime) throw new Error("Runtime required for function call");
        consume(TokenType.Punctuation, "(");
        const args: any[] = [];
        if (peek().value !== ")") {
          while (true) {
            const arg = parseAssignment();
            args.push(arg.value);
            if (peek().value === ",") {
              consume(TokenType.Punctuation, ",");
            } else {
              break;
            }
          }
        }
        consume(TokenType.Punctuation, ")");
        return { value: callFunction(runtime, name, args) };
      }
      return { value: env[name], ref: name };
    }
    if (t.type === TokenType.Keyword && t.value === "new") {
      consume(TokenType.Keyword, "new");
      const cls = consume(TokenType.Identifier).value;
      if (!runtime) throw new Error("Runtime required for new operator");
      return { value: instantiate(runtime, cls) };
    }
    if (t.value === "(") {
      consume(TokenType.Punctuation, "(");
      const r = parseAssignment();
      consume(TokenType.Punctuation, ")");
      return r;
    }
    throw new Error(`Unexpected token ${t.value}`);
  }

  function parsePostfix(): EvalResult {
    let result = parsePrimary();
    while (!atEnd() && (peek().value === "++" || peek().value === "--")) {
      const op = consume(TokenType.Operator).value;
      if (!result.ref) throw new Error("Invalid operand for " + op);
      const name = result.ref;
      const old = env[name] ?? 0;
      if (op === "++") env[name] = old + 1;
      else env[name] = old - 1;
      result = { value: old };
    }
    return result;
  }

  function parseUnary(): EvalResult {
    if (!atEnd()) {
      const t = peek();
      if (t.type === TokenType.Operator && (t.value === "++" || t.value === "--")) {
        const op = consume(TokenType.Operator).value;
        const res = parseUnary();
        if (!res.ref) throw new Error("Invalid operand for " + op);
        const name = res.ref;
        const val = env[name] ?? 0;
        if (op === "++") env[name] = val + 1;
        else env[name] = val - 1;
        return { value: env[name] };
      }
      if (
        t.type === TokenType.Operator &&
        (t.value === "+" || t.value === "-" || t.value === "!" || t.value === "~")
      ) {
        const op = consume(TokenType.Operator).value;
        const res = parseUnary();
        switch (op) {
          case "+":
            return { value: +res.value };
          case "-":
            return { value: -res.value };
          case "!":
            return { value: !res.value };
          case "~":
            return { value: ~res.value };
        }
      }
      if (t.type === TokenType.Keyword && t.value === "delete") {
        consume(TokenType.Keyword, "delete");
        const res = parseUnary();
        if (!res.ref) throw new Error("Invalid operand for delete");
        delete env[res.ref];
        return { value: undefined };
      }
    }
    return parsePostfix();
  }

  function binaryParser(nextFn: () => EvalResult, ops: Set<string>): () => EvalResult {
    return function (): EvalResult {
      let left = nextFn();
      while (!atEnd() && peek().type === TokenType.Operator && ops.has(peek().value)) {
        const op = consume(TokenType.Operator).value;
        const right = nextFn();
        switch (op) {
          case "*":
            left = { value: left.value * right.value };
            break;
          case "/":
            left = { value: left.value / right.value };
            break;
          case "%":
            left = { value: left.value % right.value };
            break;
          case "+":
            left = { value: left.value + right.value };
            break;
          case "-":
            left = { value: left.value - right.value };
            break;
          case "<<":
            left = { value: left.value << right.value };
            break;
          case ">>":
            left = { value: left.value >> right.value };
            break;
          case "<":
            left = { value: left.value < right.value };
            break;
          case ">":
            left = { value: left.value > right.value };
            break;
          case "<=":
            left = { value: left.value <= right.value };
            break;
          case ">=":
            left = { value: left.value >= right.value };
            break;
          case "==":
            left = { value: left.value == right.value };
            break;
          case "!=":
            left = { value: left.value != right.value };
            break;
          case "&":
            left = { value: left.value & right.value };
            break;
          case "^":
            left = { value: left.value ^ right.value };
            break;
          case "|":
            left = { value: left.value | right.value };
            break;
          case "&&":
            left = { value: left.value && right.value };
            break;
          case "||":
            left = { value: left.value || right.value };
            break;
        }
      }
      return left;
    };
  }

  const parseMultiplicative = binaryParser(parseUnary, new Set(["*", "/", "%"]));
  const parseAdditive = binaryParser(parseMultiplicative, new Set(["+", "-"]));
  const parseShift = binaryParser(parseAdditive, new Set(["<<", ">>"]));
  const parseRelational = binaryParser(parseShift, new Set(["<", ">", "<=", ">="]));
  const parseEquality = binaryParser(parseRelational, new Set(["==", "!="]));
  const parseBitwiseAnd = binaryParser(parseEquality, new Set(["&"]));
  const parseBitwiseXor = binaryParser(parseBitwiseAnd, new Set(["^"]));
  const parseBitwiseOr = binaryParser(parseBitwiseXor, new Set(["|"]));
  const parseLogicalAnd = binaryParser(parseBitwiseOr, new Set(["&&"]));
  const parseLogicalOr = binaryParser(parseLogicalAnd, new Set(["||"]));

  function parseConditional(): EvalResult {
    let test = parseLogicalOr();
    if (!atEnd() && peek().value === "?") {
      consume(TokenType.Operator, "?");
      const thenExpr = parseAssignment();
      consume(TokenType.Punctuation, ":");
      const elseExpr = parseAssignment();
      test = { value: test.value ? thenExpr.value : elseExpr.value };
    }
    return test;
  }

  function parseAssignment(): EvalResult {
    let left = parseConditional();
    if (!atEnd() && peek().type === TokenType.Operator && assignmentOps.has(peek().value)) {
      const op = consume(TokenType.Operator).value;
      if (!left.ref) throw new Error("Invalid assignment target");
      const right = parseAssignment();
      const oldVal = env[left.ref] ?? 0;
      let newVal;
      switch (op) {
        case "=":
          newVal = right.value;
          break;
        case "+=":
          newVal = oldVal + right.value;
          break;
        case "-=":
          newVal = oldVal - right.value;
          break;
        case "*=":
          newVal = oldVal * right.value;
          break;
        case "/=":
          newVal = oldVal / right.value;
          break;
        case "%=":
          newVal = oldVal % right.value;
          break;
        case "&=":
          newVal = oldVal & right.value;
          break;
        case "|=":
          newVal = oldVal | right.value;
          break;
        case "^=":
          newVal = oldVal ^ right.value;
          break;
        case "<<=":
          newVal = oldVal << right.value;
          break;
        case ">>=":
          newVal = oldVal >> right.value;
          break;
      }
      const isDate =
        (runtime && runtime.variables[left.ref]?.type === "datetime") ||
        oldVal instanceof DateTimeValue;
      env[left.ref] = isDate ? cast(newVal, "datetime") : newVal;
      left = { value: env[left.ref] };
    }
    return left;
  }

  const result = parseAssignment();
  if (!atEnd()) {
    throw new Error("Unexpected token " + peek().value);
  }
  return result.value;
}
