import { lex, TokenType } from "../src/core/parser/lexer";
import { describe, it, expect } from "vitest";

describe("lex", () => {
  it("tokenizes a simple declaration", () => {
    const { tokens } = lex("int a = 5;");
    expect(tokens.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: TokenType.Keyword, value: "int" },
      { type: TokenType.Identifier, value: "a" },
      { type: TokenType.Operator, value: "=" },
      { type: TokenType.Number, value: "5" },
      { type: TokenType.Punctuation, value: ";" },
    ]);
  });

  it("recognizes additional builtin types", () => {
    const { tokens } = lex("bool flag;");
    expect({ type: tokens[0].type, value: tokens[0].value }).toEqual({
      type: TokenType.Keyword,
      value: "bool",
    });
  });

  it("recognizes control statement keywords", () => {
    const { tokens } = lex("for(i=0;i<10;i++){}");
    expect({ type: tokens[0].type, value: tokens[0].value }).toEqual({
      type: TokenType.Keyword,
      value: "for",
    });
  });

  it("ignores comments and strings", () => {
    const { tokens } = lex('int a = 5; // comment\n/*multi*/string s="hi";');
    expect(tokens.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: TokenType.Keyword, value: "int" },
      { type: TokenType.Identifier, value: "a" },
      { type: TokenType.Operator, value: "=" },
      { type: TokenType.Number, value: "5" },
      { type: TokenType.Punctuation, value: ";" },
      { type: TokenType.Keyword, value: "string" },
      { type: TokenType.Identifier, value: "s" },
      { type: TokenType.Operator, value: "=" },
      { type: TokenType.String, value: "hi" },
      { type: TokenType.Punctuation, value: ";" },
    ]);
  });

  it("skips comments containing nested markers", () => {
    const { tokens } = lex("int a; /* start /* inner */ int b;");
    expect(tokens.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: TokenType.Keyword, value: "int" },
      { type: TokenType.Identifier, value: "a" },
      { type: TokenType.Punctuation, value: ";" },
      { type: TokenType.Keyword, value: "int" },
      { type: TokenType.Identifier, value: "b" },
      { type: TokenType.Punctuation, value: ";" },
    ]);
  });

  it("allows single line comments inside block comments", () => {
    const { tokens } = lex("int a; /* text // inner\nstill */ int b;");
    expect(tokens.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: TokenType.Keyword, value: "int" },
      { type: TokenType.Identifier, value: "a" },
      { type: TokenType.Punctuation, value: ";" },
      { type: TokenType.Keyword, value: "int" },
      { type: TokenType.Identifier, value: "b" },
      { type: TokenType.Punctuation, value: ";" },
    ]);
  });

  it("reports unterminated block comment", () => {
    const res = lex("/*");
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it("handles escape sequences and two-char operators", () => {
    const { tokens } = lex('"a\\"b"==');
    expect(tokens.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: TokenType.String, value: 'a\\"b' },
      { type: TokenType.Operator, value: "==" },
    ]);
  });

  it("recognizes compound and multi-character operators", () => {
    const { tokens } = lex("i+=2; j<<=1; k++; a?b:c;");
    expect(tokens.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: TokenType.Identifier, value: "i" },
      { type: TokenType.Operator, value: "+=" },
      { type: TokenType.Number, value: "2" },
      { type: TokenType.Punctuation, value: ";" },
      { type: TokenType.Identifier, value: "j" },
      { type: TokenType.Operator, value: "<<=" },
      { type: TokenType.Number, value: "1" },
      { type: TokenType.Punctuation, value: ";" },
      { type: TokenType.Identifier, value: "k" },
      { type: TokenType.Operator, value: "++" },
      { type: TokenType.Punctuation, value: ";" },
      { type: TokenType.Identifier, value: "a" },
      { type: TokenType.Operator, value: "?" },
      { type: TokenType.Identifier, value: "b" },
      { type: TokenType.Punctuation, value: ":" },
      { type: TokenType.Identifier, value: "c" },
      { type: TokenType.Punctuation, value: ";" },
    ]);
  });

  it("distinguishes prefix and postfix increment/decrement", () => {
    const { tokens: pre } = lex("--a");
    const { tokens: post } = lex("a++");
    expect(pre.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: TokenType.Operator, value: "--" },
      { type: TokenType.Identifier, value: "a" },
    ]);
    expect(post.map((t) => ({ type: t.type, value: t.value }))).toEqual([
      { type: TokenType.Identifier, value: "a" },
      { type: TokenType.Operator, value: "++" },
    ]);
  });

  it("reports unknown characters", () => {
    const res = lex("#");
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it("enforces identifier length limit", () => {
    const longName = "a".repeat(64);
    const res = lex(`${longName} = 1;`);
    expect(res.errors[0].message).toBe("Identifier too long");
  });

  it("treats reserved words as keywords", () => {
    const { tokens } = lex("template<typename T> struct S {};");
    expect({ type: tokens[0].type, value: tokens[0].value }).toEqual({
      type: TokenType.Keyword,
      value: "template",
    });
    expect({ type: tokens[2].type, value: tokens[2].value }).toEqual({
      type: TokenType.Keyword,
      value: "typename",
    });
  });

  it("fails when reserved word used as identifier", () => {
    const { tokens } = lex("int for = 1;");
    expect({ type: tokens[1].type, value: tokens[1].value }).toEqual({
      type: TokenType.Keyword,
      value: "for",
    });
  });
});
