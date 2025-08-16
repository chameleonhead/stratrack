// Simple execution of control-flow statements using evaluated expressions.
// This is not a full interpreter but supports basic loops and if/switch.

import { lex, Token, TokenType } from "../parser/lexer.js";
import { evaluateExpression, EvalEnv } from "./expression.js";
import type { Runtime } from "./types.js";
import { cast, PrimitiveType } from "./casting.js";

interface ExecResult {
  break?: boolean;
  continue?: boolean;
  return?: any;
}

const typeKeywords = new Set([
  "void",
  "bool",
  "char",
  "uchar",
  "short",
  "ushort",
  "int",
  "uint",
  "long",
  "ulong",
  "float",
  "double",
  "color",
  "datetime",
  "string",
]);

function tokensToString(tokens: Token[]): string {
  return tokens
    .map((t) => (t.type === TokenType.String ? `"${t.value.replace(/"/g, '\\"')}"` : t.value))
    .join(" ");
}

export function executeStatements(
  source: string,
  env: EvalEnv = {},
  runtime?: Runtime
): ExecResult {
  const { tokens, errors } = lex(source);
  if (errors.length) {
    throw new Error(errors.map((e) => e.message).join("\n"));
  }
  let pos = 0;

  const peek = () => tokens[pos];
  const atEnd = () => pos >= tokens.length;
  const consume = (type?: TokenType, value?: string): Token => {
    const t = tokens[pos];
    if (!t) throw new Error("Unexpected end of input");
    if (type && t.type !== type) throw new Error(`Expected ${type} but found ${t.type}`);
    if (value && t.value !== value) throw new Error(`Expected ${value} but found ${t.value}`);
    pos++;
    return t;
  };

  const readExpression = (endValue: string): string => {
    const parts: Token[] = [];
    let depth = 0;
    while (!atEnd()) {
      const t = peek();
      if (depth === 0 && t.value === endValue) break;
      if (t.value === "(") depth++;
      if (t.value === ")") depth--;
      parts.push(consume());
    }
    return tokensToString(parts);
  };

  const captureStatementSource = (): string => {
    if (peek().value === "{") {
      consume(TokenType.Punctuation, "{");
      const start = pos;
      let depth = 1;
      while (!atEnd() && depth > 0) {
        const t = consume();
        if (t.value === "{") depth++;
        if (t.value === "}") depth--;
      }
      const slice = tokens.slice(start, pos - 1); // exclude closing }
      return tokensToString(slice);
    } else {
      const start = pos;
      while (!atEnd()) {
        const t = consume();
        if (t.value === ";") break;
      }
      const slice = tokens.slice(start, pos - 1); // exclude ;
      return tokensToString(slice);
    }
  };

  const captureCaseBody = (): string => {
    const start = pos;
    let depth = 0;
    while (!atEnd()) {
      const t = peek();
      if (depth === 0 && (t.value === "case" || t.value === "default" || t.value === "}")) break;
      if (t.value === "{") depth++;
      if (t.value === "}") depth--;
      consume();
    }
    const slice = tokens.slice(start, pos);
    return tokensToString(slice);
  };

  const skipStatement = () => {
    if (peek().value === "{") {
      consume(TokenType.Punctuation, "{");
      let depth = 1;
      while (!atEnd() && depth > 0) {
        const t = consume();
        if (t.value === "{") depth++;
        if (t.value === "}") depth--;
      }
    } else {
      while (!atEnd()) {
        const t = consume();
        if (t.value === ";") break;
      }
    }
  };

  const exec = (): ExecResult => {
    if (atEnd()) return {};
    const t = peek();

    // variable declaration
    if (t.type === TokenType.Keyword && typeKeywords.has(t.value)) {
      const type = t.value;
      consume(TokenType.Keyword);
      const name = consume(TokenType.Identifier).value;
      let val: any = undefined;
      if (!atEnd() && peek().value === "=") {
        consume(TokenType.Operator, "=");
        const expr = readExpression(";");
        val = evaluateExpression(expr, env, runtime);
        try {
          val = cast(val, type as PrimitiveType);
        } catch {
          /* ignore */
        }
      }
      consume(TokenType.Punctuation, ";");
      env[name] = val;
      return {};
    }

    if (t.type === TokenType.Keyword) {
      switch (t.value) {
        case "if": {
          consume(TokenType.Keyword, "if");
          consume(TokenType.Punctuation, "(");
          const cond = readExpression(")");
          consume(TokenType.Punctuation, ")");
          const condVal = evaluateExpression(cond, env, runtime);
          if (condVal) {
            const body = captureStatementSource();
            const r = executeStatements(body, env, runtime);
            if (r.return !== undefined || r.break || r.continue) return r;
            if (!atEnd() && peek().type === TokenType.Keyword && peek().value === "else") {
              consume(TokenType.Keyword, "else");
              skipStatement();
            }
          } else {
            skipStatement();
            if (!atEnd() && peek().type === TokenType.Keyword && peek().value === "else") {
              consume(TokenType.Keyword, "else");
              const body = captureStatementSource();
              const r = executeStatements(body, env, runtime);
              if (r.return !== undefined || r.break || r.continue) return r;
            }
          }
          return {};
        }
        case "while": {
          consume(TokenType.Keyword, "while");
          consume(TokenType.Punctuation, "(");
          const condExpr = readExpression(")");
          consume(TokenType.Punctuation, ")");
          const body = captureStatementSource();
          while (evaluateExpression(condExpr, env, runtime)) {
            const r = executeStatements(body, env, runtime);
            if (r.return !== undefined) return r;
            if (r.break) break;
            if (r.continue) continue;
          }
          return {};
        }
        case "do": {
          consume(TokenType.Keyword, "do");
          const body = captureStatementSource();
          consume(TokenType.Keyword, "while");
          consume(TokenType.Punctuation, "(");
          const condExpr = readExpression(")");
          consume(TokenType.Punctuation, ")");
          if (!atEnd() && peek().value === ";") consume(TokenType.Punctuation, ";");
          do {
            const r = executeStatements(body, env, runtime);
            if (r.return !== undefined) return r;
            if (r.break) break;
            if (r.continue) {
              continue;
            }
          } while (evaluateExpression(condExpr, env, runtime));
          return {};
        }
        case "for": {
          consume(TokenType.Keyword, "for");
          consume(TokenType.Punctuation, "(");
          const init = readExpression(";");
          consume(TokenType.Punctuation, ";");
          const cond = readExpression(";");
          consume(TokenType.Punctuation, ";");
          const post = readExpression(")");
          consume(TokenType.Punctuation, ")");
          const body = captureStatementSource();
          if (init.trim()) evaluateExpression(init, env, runtime);
          while (true) {
            if (cond.trim() && !evaluateExpression(cond, env, runtime)) break;
            const r = executeStatements(body, env, runtime);
            if (r.return !== undefined) return r;
            if (r.break) break;
            if (post.trim()) evaluateExpression(post, env, runtime);
            if (r.continue) continue;
          }
          return {};
        }
        case "switch": {
          consume(TokenType.Keyword, "switch");
          consume(TokenType.Punctuation, "(");
          const expr = readExpression(")");
          consume(TokenType.Punctuation, ")");
          consume(TokenType.Punctuation, "{");
          const switchVal = evaluateExpression(expr, env, runtime);
          let executing = false;
          while (!atEnd() && peek().value !== "}") {
            if (peek().type === TokenType.Keyword && peek().value === "case") {
              consume(TokenType.Keyword, "case");
              const valExpr = readExpression(":");
              consume(TokenType.Punctuation, ":");
              const caseVal = evaluateExpression(valExpr, env, runtime);
              if (executing || switchVal === caseVal) executing = true;
              const body = captureCaseBody();
              if (executing) {
                const r = executeStatements(body, env, runtime);
                if (r.return !== undefined) return r;
                if (r.break) {
                  executing = false;
                  while (!atEnd() && peek().value !== "}") consume();
                  break;
                }
              }
            } else if (peek().type === TokenType.Keyword && peek().value === "default") {
              consume(TokenType.Keyword, "default");
              consume(TokenType.Punctuation, ":");
              const body = captureCaseBody();
              if (!executing) {
                const r = executeStatements(body, env, runtime);
                if (r.return !== undefined) return r;
                if (r.break) break;
              }
            } else {
              // should not happen, skip token
              consume();
            }
          }
          if (!atEnd() && peek().value === "}") consume(TokenType.Punctuation, "}");
          return {};
        }
        case "break": {
          consume(TokenType.Keyword, "break");
          if (!atEnd() && peek().value === ";") consume(TokenType.Punctuation, ";");
          return { break: true };
        }
        case "continue": {
          consume(TokenType.Keyword, "continue");
          if (!atEnd() && peek().value === ";") consume(TokenType.Punctuation, ";");
          return { continue: true };
        }
        case "return": {
          consume(TokenType.Keyword, "return");
          let val: any = undefined;
          if (peek().value !== ";") {
            const expr = readExpression(";");
            val = evaluateExpression(expr, env, runtime);
          }
          if (!atEnd() && peek().value === ";") consume(TokenType.Punctuation, ";");
          return { return: val };
        }
      }
    }

    if (t.value === "{") {
      consume(TokenType.Punctuation, "{");
      while (!atEnd() && peek().value !== "}") {
        const r = exec();
        if (r.return !== undefined || r.break || r.continue) {
          while (!atEnd() && peek().value !== "}") skipStatement();
          consume(TokenType.Punctuation, "}");
          return r;
        }
      }
      if (!atEnd()) consume(TokenType.Punctuation, "}");
      return {};
    }

    // expression statement
    const expr = readExpression(";");
    consume(TokenType.Punctuation, ";");
    evaluateExpression(expr, env, runtime);
    return {};
  };

  while (!atEnd()) {
    const res = exec();
    if (res.return !== undefined || res.break || res.continue) return res;
  }
  return {};
}
