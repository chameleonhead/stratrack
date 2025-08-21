export interface EvalEnv {
  [name: string]: any;
}

import { lex, Token, TokenType } from "../parser/lexer";
import { cast } from "./casting";
import { intBinaryOp } from "./intMath";

interface EvalResult {
  value: any;
  ref?: string;
  type?: string;
}

// Operators for assignment
const assignmentOps = new Set(["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="]);

import type { RuntimeState } from "./types";
import { instantiate, callFunction } from "./runtime";

export function evaluateExpression(expr: string, env: EvalEnv = {}, runtime?: RuntimeState): any {
  const { tokens, errors } = lex(expr);
  if (errors.length) {
    throw new Error(errors.map((e) => e.message).join("\n"));
  }
  let pos = 0;

  const intTypes = new Set([
    "char",
    "uchar",
    "short",
    "ushort",
    "int",
    "uint",
    "long",
    "ulong",
    "bool",
    "color",
    "datetime",
  ]);
  const unsignedTypes = new Set(["uchar", "ushort", "uint", "ulong"]);

  const getIntInfo = (r: EvalResult): { bits: 32 | 64; unsigned: boolean } | undefined => {
    if (r.type) {
      if (!intTypes.has(r.type)) return undefined;
      const bits = r.type === "long" || r.type === "ulong" || r.type === "datetime" ? 64 : 32;
      return { bits, unsigned: unsignedTypes.has(r.type) };
    }
    if (typeof r.value === "bigint") return { bits: 64, unsigned: false };
    if (typeof r.value === "number" && Number.isInteger(r.value))
      return { bits: 32, unsigned: false };
    return undefined;
  };

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
      if (t.value.includes(".") || t.value.includes("e") || t.value.includes("E")) {
        return { value: Number(t.value), type: "double" };
      }
      const bi = BigInt(t.value);
      if (bi >= -2147483648n && bi <= 2147483647n) {
        return { value: Number(bi), type: "int" };
      }
      return { value: bi, type: "long" };
    }
    if (t.type === TokenType.String) {
      consume();
      return { value: t.value };
    }
    if (t.type === TokenType.Keyword && (t.value === "true" || t.value === "false")) {
      consume();
      return { value: t.value === "true" ? 1 : 0, type: "bool" };
    }
    if (t.type === TokenType.Identifier) {
      consume();
      const name = t.value;
      const vtype = runtime?.variables[name]?.type;
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
      return { value: env[name], ref: name, type: vtype };
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
      const varType = runtime?.variables[name]?.type;
      if (varType && intTypes.has(varType)) {
        const info = getIntInfo({ value: old, type: varType })!;
        const step = op === "++" ? 1 : -1;
        const val = intBinaryOp("+", old, step, info.bits, info.unsigned);
        env[name] = cast(val, varType as any);
      } else {
        const step = op === "++" ? 1 : -1;
        env[name] = varType ? cast(old + step, varType as any) : old + step;
      }
      result = { value: old, type: varType, ref: name };
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
        const varType = runtime?.variables[name]?.type;
        if (varType && intTypes.has(varType)) {
          const info = getIntInfo({ value: val, type: varType })!;
          const step = op === "++" ? 1 : -1;
          const v = intBinaryOp("+", val, step, info.bits, info.unsigned);
          env[name] = cast(v, varType as any);
        } else {
          const step = op === "++" ? 1 : -1;
          env[name] = varType ? cast(val + step, varType as any) : val + step;
        }
        return { value: env[name], type: varType };
      }
      if (
        t.type === TokenType.Operator &&
        (t.value === "+" || t.value === "-" || t.value === "!" || t.value === "~")
      ) {
        const op = consume(TokenType.Operator).value;
        const res = parseUnary();
        switch (op) {
          case "+":
            return { value: +res.value, type: res.type };
          case "-":
            return { value: -res.value, type: res.type };
          case "!":
            return { value: !res.value };
          case "~":
            return { value: ~res.value, type: res.type };
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
        const lInfo = getIntInfo(left);
        const rInfo = getIntInfo(right);
        const useInt = lInfo && rInfo;
        const bits = useInt && (lInfo.bits === 64 || rInfo.bits === 64) ? 64 : 32;
        const unsigned = Boolean(lInfo?.unsigned || rInfo?.unsigned);
        switch (op) {
          case "*":
          case "/":
          case "%":
          case "+":
          case "-":
          case "<<":
          case ">>":
          case "&":
          case "^":
          case "|":
            if (useInt) {
              const resultType =
                left.type === "datetime" || right.type === "datetime"
                  ? "datetime"
                  : bits === 64
                    ? unsigned
                      ? "ulong"
                      : "long"
                    : unsigned
                      ? "uint"
                      : "int";
              left = {
                value: intBinaryOp(op, left.value, right.value, bits, unsigned),
                type: resultType,
              };
            } else {
              let value;
              switch (op) {
                case "*":
                  value = left.value * right.value;
                  break;
                case "/":
                  value = left.value / right.value;
                  break;
                case "%":
                  value = left.value % right.value;
                  break;
                case "+":
                  value = left.value + right.value;
                  break;
                case "-":
                  value = left.value - right.value;
                  break;
                case "<<":
                  value = left.value << right.value;
                  break;
                case ">>":
                  value = left.value >> right.value;
                  break;
                case "&":
                  value = left.value & right.value;
                  break;
                case "^":
                  value = left.value ^ right.value;
                  break;
                case "|":
                  value = left.value | right.value;
                  break;
              }
              const resultType =
                left.type === "double" || right.type === "double"
                  ? "double"
                  : left.type === "float" || right.type === "float"
                    ? "float"
                    : undefined;
              left = {
                value: resultType === "float" ? Math.fround(value) : value,
                type: resultType,
              };
            }
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
      const varType = runtime?.variables[left.ref]?.type as string | undefined;
      let newVal;
      if (op === "=") {
        newVal = right.value;
      } else if (varType && intTypes.has(varType)) {
        const info = getIntInfo({ value: oldVal, type: varType })!;
        const baseOp = op.slice(0, -1);
        const rVal = cast(right.value, varType as any);
        newVal = intBinaryOp(baseOp, oldVal, rVal, info.bits, info.unsigned);
      } else {
        switch (op) {
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
      }
      env[left.ref] = varType ? cast(newVal, varType as any) : newVal;
      left = { value: env[left.ref], type: varType };
    }
    return left;
  }

  const result = parseAssignment();
  if (!atEnd()) {
    throw new Error("Unexpected token " + peek().value);
  }
  return result.value;
}
