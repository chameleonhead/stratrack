import { describe, it, expect } from "vitest";
import { renderMqlProgram } from "./renderer";
import { MqlProgram } from "./ast"; // 実際のAST型定義ファイルに合わせてください

describe("renderMqlProgram", () => {
  it("renders a basic program with properties and buffers", () => {
    const program: MqlProgram = {
      type: "program",
      kind: "indicator",
      properties: ["strict", "indicator_chart_window"],
      buffers: [
        { name: "macd", index: 0, label: "MACD", style: "DRAW_LINE" },
        { name: "signal", index: 1 },
      ],
      declarations: [],
      functions: [],
    };

    const result = renderMqlProgram(program);
    expect(result).toContain(`#property strict`);
    expect(result).toContain(`double macd[];`);
    expect(result).toContain(`#property indicator_label0 "MACD"`);
    expect(result).toContain(`#property indicator_type0 DRAW_LINE`);
    expect(result).toContain(`double signal[];`);
  });

  it("renders a function with statements", () => {
    const program: MqlProgram = {
      type: "program",
      kind: "expert",
      properties: [],
      buffers: [],
      declarations: [],
      functions: [
        {
          type: "function",
          name: "OnTick",
          returnType: "void",
          args: [],
          body: [
            {
              type: "assign_stmt",
              variable: { type: "var_ref", name: "x" },
              value: {
                type: "binary",
                operator: "+",
                left: { type: "literal", value: "1" },
                right: { type: "literal", value: "2" },
              },
            },
            {
              type: "return",
              expr: undefined,
            },
          ],
        },
      ],
    };

    const result = renderMqlProgram(program);
    expect(result).toContain(`void OnTick()`);
    expect(result).toContain(`x = 1 + 2;`);
    expect(result).toContain(`return;`);
  });

  it("renders a class with method and constructor", () => {
    const program: MqlProgram = {
      type: "program",
      kind: "expert",
      properties: [],
      buffers: [],
      declarations: [],
      functions: [],
      classes: [
        {
          type: "class",
          name: "Sample",
          fields: [{ type: "field", name: "val", varType: "int", access: "private" }],
          ctor: {
            type: "constructor",
            args: [{ name: "v", type: "int" }],
            body: [
              {
                type: "assign_stmt",
                variable: { type: "var_ref", name: "val" },
                value: { type: "var_ref", name: "v" },
              },
            ],
            access: "public",
          },
          dtor: undefined,
          methods: [
            {
              type: "method",
              name: "get",
              returnType: "int",
              args: [],
              body: [{ type: "return", expr: { type: "var_ref", name: "val" } }],
              access: "public",
            },
          ],
        },
      ],
    };

    const result = renderMqlProgram(program);
    expect(result).toContain(`class Sample {`);
    expect(result).toContain(`private:`);
    expect(result).toContain(`  int val;`);
    expect(result).toContain(`public:`);
    expect(result).toContain(`  int get() {`);
    expect(result).toContain(`    return val;`);
    expect(result).toContain(`  }`);
    expect(result).toContain(`  Sample(int v) {`);
    expect(result).toContain(`    val = v;`);
    expect(result).toContain(`  }`);
    expect(result).toContain(`};`);
  });

  it("renders a ternary expression correctly", () => {
    const program: MqlProgram = {
      type: "program",
      kind: "expert",
      properties: [],
      buffers: [],
      declarations: [],
      functions: [
        {
          type: "function",
          name: "Decision",
          returnType: "int",
          args: [],
          body: [
            {
              type: "return",
              expr: {
                type: "ternary",
                condition: { type: "var_ref", name: "a" },
                trueExpr: { type: "literal", value: "1" },
                falseExpr: { type: "literal", value: "0" },
              },
            },
          ],
        },
      ],
    };

    const result = renderMqlProgram(program);
    expect(result).toContain(`int Decision() {`);
    expect(result).toContain(`  return a ? 1 : 0;`);
    expect(result).toContain(`}`);
  });
  it("renders an if-else statement", () => {
    const program: MqlProgram = {
      type: "program",
      kind: "expert",
      properties: [],
      buffers: [],
      declarations: [],
      functions: [
        {
          type: "function",
          name: "CheckSignal",
          returnType: "void",
          args: [],
          body: [
            {
              type: "if",
              condition: {
                type: "binary",
                operator: ">",
                left: { type: "var_ref", name: "a" },
                right: { type: "literal", value: "10" },
              },
              thenBranch: [
                {
                  type: "expr_stmt",
                  expr: {
                    type: "call",
                    name: "Print",
                    args: [{ type: "literal", value: `"High"` }],
                  },
                },
              ],
              elseBranch: [
                {
                  type: "expr_stmt",
                  expr: {
                    type: "call",
                    name: "Print",
                    args: [{ type: "literal", value: `"Low"` }],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const result = renderMqlProgram(program);
    expect(result).toContain(`  if (a > 10) {`);
    expect(result).toContain(`    Print("High");`);
    expect(result).toContain(`  }`);
    expect(result).toContain(`  else {`);
    expect(result).toContain(`    Print("Low");`);
    expect(result).toContain(`  }`);
  });

  it("renders a for loop", () => {
    const program: MqlProgram = {
      type: "program",
      kind: "expert",
      properties: [],
      buffers: [],
      declarations: [],
      functions: [
        {
          type: "function",
          name: "Sum",
          returnType: "int",
          args: [],
          body: [
            {
              type: "decl_stmt",
              decl: {
                type: "declaration",
                name: "sum",
                varType: "int",
                init: { type: "literal", value: "0" },
              },
            },
            {
              type: "for",
              init: {
                type: "decl_stmt",
                decl: {
                  type: "declaration",
                  name: "i",
                  varType: "int",
                  init: { type: "literal", value: "0" },
                },
              },
              condition: {
                type: "binary",
                operator: "<",
                left: { type: "var_ref", name: "i" },
                right: { type: "literal", value: "10" },
              },
              increment: {
                type: "assign_stmt",
                variable: { type: "var_ref", name: "i" },
                value: {
                  type: "binary",
                  operator: "+",
                  left: { type: "var_ref", name: "i" },
                  right: { type: "literal", value: "1" },
                },
              },
              body: [
                {
                  type: "assign_stmt",
                  variable: { type: "var_ref", name: "sum" },
                  value: {
                    type: "binary",
                    operator: "+",
                    left: { type: "var_ref", name: "sum" },
                    right: { type: "var_ref", name: "i" },
                  },
                },
              ],
            },
            {
              type: "return",
              expr: { type: "var_ref", name: "sum" },
            },
          ],
        },
      ],
    };

    const result = renderMqlProgram(program);
    expect(result).toContain(`int i = 0`);
    expect(result).toContain(`for (int i = 0; i < 10; i = i + 1) {`);
    expect(result).toContain(`sum = sum + i;`);
    expect(result).toContain(`return sum;`);
  });
});
