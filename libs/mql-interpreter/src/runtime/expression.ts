export interface EvalEnv {
  [name: string]: any;
}

import { lex, Token, TokenType } from "../parser/lexer";
import { cast } from "./casting";
import { intBinaryOp } from "./intMath";

interface IndexRef {
  name: string;
  indices: number[];
}

interface EvalResult {
  value: any;
  ref?: string | IndexRef;
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
    if (value && t.value !== value) {
      // Debug info
      const context = tokens.slice(Math.max(0, pos - 3), Math.min(tokens.length, pos + 4))
        .map((tk, i) => (i === 3 ? `[${tk.value}:${tk.type}]` : `${tk.value}:${tk.type}`))
        .join(' ');
      throw new Error(`Expected ${value} but got ${t.value}. Context: ${context}. At position ${pos}`);
    }
    pos++;
    return t;
  };

  const getRefValue = (ref: string | IndexRef | undefined): any => {
    if (!ref) return undefined;
    if (typeof ref === "string") return env[ref];
    let cur = env[ref.name];
    for (const idx of ref.indices) cur = cur?.[idx];
    return cur;
  };

  const setRefValue = (ref: string | IndexRef | undefined, value: any): void => {
    if (!ref) throw new Error("Invalid assignment target");
    if (typeof ref === "string") {
      env[ref] = value;
      return;
    }
    let container = env[ref.name];
    if (!Array.isArray(container)) container = env[ref.name] = [];
    for (let i = 0; i < ref.indices.length - 1; i++) {
      const idx = ref.indices[i];
      if (!Array.isArray(container[idx])) container[idx] = [];
      container = container[idx];
    }
    container[ref.indices[ref.indices.length - 1]] = value;
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
        // Treat any identifier followed by parentheses as a function call
        // The callFunction will handle whether it's a valid function or not
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
    // Handle type casting: int(value), double(value), string(value), etc.
    if (t.type === TokenType.Keyword && ["int", "double", "float", "string", "bool", "datetime", "color", "long", "short", "char", "uchar", "uint", "ulong", "ushort"].includes(t.value)) {
      // Look ahead to see if this is actually a type cast (type followed by opening parenthesis)
      if (!atEnd() && pos + 1 < tokens.length && tokens[pos + 1].value === "(") {
        const castType = consume(TokenType.Keyword).value;
        consume(TokenType.Punctuation, "(");
        const expr = parseAssignment();
        consume(TokenType.Punctuation, ")");
        // Perform type casting
        const value = expr.value;
        switch (castType) {
          case "int":
          case "long":
          case "short":
          case "char":
          case "uchar":
          case "uint":
          case "ulong":
          case "ushort":
            return { value: Math.trunc(Number(value)) };
          case "double":
          case "float":
            return { value: Number(value) };
          case "string":
            return { value: String(value) };
          case "bool":
            return { value: Boolean(value) };
          case "datetime":
          case "color":
            return { value: Number(value) };
          default:
            return expr;
        }
      }
      // If no immediate parentheses, treat as identifier (may be a variable name)
      const name = consume(TokenType.Keyword).value;
      return { value: env[name], ref: name };
    }
    if (t.value === "(") {
      consume(TokenType.Punctuation, "(");
      const r = parseAssignment();
      consume(TokenType.Punctuation, ")");
      return r;
    }

    throw new Error(`Unexpected token ${t.value} (type: ${t.type})`);
  }

  function parsePostfix(): EvalResult {
    let result = parsePrimary();
    while (!atEnd()) {
      const t = peek();
      if (t.value === "[") {
        consume(TokenType.Punctuation, "[");
        const idxExpr = parseAssignment();
        consume(TokenType.Punctuation, "]");
        const idx = Number(idxExpr.value) | 0;
        let refObj: IndexRef | undefined;
        if (typeof result.ref === "string") {
          refObj = { name: result.ref, indices: [idx] };
        } else if (result.ref && typeof result.ref === "object" && "name" in result.ref) {
          refObj = { name: (result.ref as IndexRef).name, indices: [...(result.ref as IndexRef).indices, idx] };
        }
        const baseVal = getRefValue(refObj ?? (typeof result.ref === "string" ? result.ref : undefined)) ?? result.value;
        const value = Array.isArray(baseVal) ? baseVal[idx] : undefined;
        result = { value, type: result.type, ref: refObj ?? result.ref };
        continue;
      }
      if (t.value === "++" || t.value === "--") {
        const op = consume(TokenType.Operator).value;
        if (!result.ref) throw new Error("Invalid operand for " + op);
        const name = typeof result.ref === "string" ? result.ref : (result.ref as IndexRef).name;
        const old = getRefValue(result.ref) ?? 0;
        const varType = runtime?.variables[name]?.type;
        if (varType && intTypes.has(varType)) {
          const info = getIntInfo({ value: old, type: varType })!;
          const step = op === "++" ? 1 : -1;
          const val = intBinaryOp("+", old, step, info.bits, info.unsigned);
          setRefValue(result.ref, cast(val, varType as any));
        } else {
          const step = op === "++" ? 1 : -1;
          const v = varType ? cast(old + step, varType as any) : old + step;
          setRefValue(result.ref, v);
        }
        result = { value: old, type: varType, ref: result.ref };
        continue;
      }
      break;
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
        const name = typeof res.ref === "string" ? res.ref : (res.ref as IndexRef).name;
        const val = getRefValue(res.ref) ?? 0;
        const varType = runtime?.variables[name]?.type;
        if (varType && intTypes.has(varType)) {
          const info = getIntInfo({ value: val, type: varType })!;
          const step = op === "++" ? 1 : -1;
          const v = intBinaryOp("+", val, step, info.bits, info.unsigned);
          setRefValue(res.ref, cast(v, varType as any));
        } else {
          const step = op === "++" ? 1 : -1;
          const nv = varType ? cast(val + step, varType as any) : val + step;
          setRefValue(res.ref, nv);
        }
        return { value: getRefValue(res.ref), type: varType };
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
        delete env[res.ref as string];
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
      const oldVal = getRefValue(left.ref) ?? 0;
      const name = typeof left.ref === "string" ? left.ref : (left.ref as IndexRef).name;
      const varType = runtime?.variables[name]?.type as string | undefined;
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
      const finalVal = varType ? cast(newVal, varType as any) : newVal;
      setRefValue(left.ref, finalVal);
      left = { value: getRefValue(left.ref), type: varType, ref: left.ref };
    }
    return left;
  }

  const result = parseAssignment();
  if (!atEnd()) {
    // Allow remaining tokens (like semicolons) without throwing error
    console.warn("Remaining tokens in expression:", tokens.slice(pos).map(t => t.value).join(' '));
  }
  return result.value;
}
