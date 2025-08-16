import { lex } from "../../src/parser/lexer";
import { parse, EnumDeclaration, ClassDeclaration } from "../../src/parser/parser";
import { describe, it, expect } from "vitest";

describe("parse", () => {
  it("parses enum declaration", () => {
    const { tokens } = lex("enum Color { Red = 1, Green, Blue };");
    const ast = parse(tokens);
    const enumDecl = ast[0] as EnumDeclaration;
    expect(enumDecl.type).toBe("EnumDeclaration");
    expect(enumDecl.name).toBe("Color");
    expect(enumDecl.members).toEqual([
      { name: "Red", value: "1" },
      { name: "Green", value: undefined },
      { name: "Blue", value: undefined },
    ]);
  });

  it("parses class with base", () => {
    const { tokens } = lex("class Child : Parent { }");
    const ast = parse(tokens);
    const classDecl = ast[0] as ClassDeclaration;
    expect(classDecl.type).toBe("ClassDeclaration");
    expect(classDecl.name).toBe("Child");
    expect(classDecl.base).toBe("Parent");
    expect(classDecl.fields.length).toBe(0);
  });

  it("parses struct declaration", () => {
    const { tokens } = lex("struct Point { int x; int y; };");
    const ast = parse(tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.name).toBe("Point");
    expect(decl.fields.length).toBe(2);
  });

  it("parses class fields", () => {
    const { tokens } = lex("class A { int a; string b; }");
    const ast = parse(tokens);
    const classDecl = ast[0] as ClassDeclaration;
    expect(classDecl.fields).toEqual([
      { name: "a", fieldType: "int", dimensions: [], static: false },
      { name: "b", fieldType: "string", dimensions: [], static: false },
    ]);
  });

  it("parses dynamic array fields", () => {
    const { tokens } = lex("class B { double arr[]; int matrix[][10]; }");
    const ast = parse(tokens);
    const classDecl = ast[0] as ClassDeclaration;
    expect(classDecl.fields).toEqual([
      { name: "arr", fieldType: "double", dimensions: [null], static: false },
      { name: "matrix", fieldType: "int", dimensions: [null, 10], static: false },
    ]);
  });

  it("parses static and virtual members", () => {
    const code = "class S{ static int c; virtual void tick(); static void util(); }";
    const ast = parse(lex(code).tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.fields[0]).toEqual({ name: "c", fieldType: "int", dimensions: [], static: true });
    expect(decl.methods[0].name).toBe("tick");
    expect(decl.methods[0].virtual).toBe(true);
    expect(decl.methods[1].static).toBe(true);
  });

  it("parses abstract classes and pure virtual methods", () => {
    const code = "abstract class A{ virtual void f()=0; };";
    const ast = parse(lex(code).tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.abstract).toBe(true);
    expect(decl.methods[0].pure).toBe(true);
  });

  it("parses class methods and operator overloads", () => {
    const { tokens } = lex(
      "class X{public:int a; int Add(int v); double operator+(double b); X(); ~X();}"
    );
    const ast = parse(tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.methods.map((m) => m.name)).toEqual(["Add", "operator+", "X", "~X"]);
    expect(decl.methods[0].parameters[0].paramType).toBe("int");
    expect(decl.methods[1].returnType).toBe("double");
    expect(decl.methods[0].visibility).toBe("public");
  });

  it("parses function definitions", () => {
    const { tokens } = lex("int sum(int a, int b) { return a+b; }");
    const ast = parse(tokens);
    const fn = ast[0] as any;
    expect(fn.type).toBe("FunctionDeclaration");
    expect(fn.name).toBe("sum");
    expect(fn.returnType).toBe("int");
    expect(fn.parameters).toEqual([
      { paramType: "int", byRef: false, name: "a", dimensions: [], defaultValue: undefined },
      { paramType: "int", byRef: false, name: "b", dimensions: [], defaultValue: undefined },
    ]);
  });

  it("parses function prototypes with default values", () => {
    const { tokens } = lex('void log(string s="hi");');
    const ast = parse(tokens);
    const fn = ast[0] as any;
    expect(fn.parameters[0].defaultValue).toBe("hi");
  });

  it("parses functions with explicit void parameter", () => {
    const { tokens } = lex("void f(void){ }");
    const ast = parse(tokens);
    const fn = ast[0] as any;
    expect(fn.parameters.length).toBe(0);
  });

  it("parses reference parameters and arrays", () => {
    const { tokens } = lex("void modify(int &ref, double vals[]);");
    const ast = parse(tokens);
    const fn = ast[0] as any;
    expect(fn.parameters).toEqual([
      { paramType: "int", byRef: true, name: "ref", dimensions: [], defaultValue: undefined },
      {
        paramType: "double",
        byRef: false,
        name: "vals",
        dimensions: [null],
        defaultValue: undefined,
      },
    ]);
  });

  it("parses multiple declarations", () => {
    const { tokens } = lex("enum E{A};class C{}");
    const ast = parse(tokens);
    expect(ast.length).toBe(2);
    expect((ast[1] as ClassDeclaration).name).toBe("C");
  });

  it("parses overloaded functions separately", () => {
    const { tokens } = lex("void f(); void f(int a);");
    const ast = parse(tokens);
    expect(ast.length).toBe(2);
    expect((ast[0] as any).name).toBe("f");
    expect((ast[1] as any).parameters.length).toBe(1);
  });

  it("skips irrelevant tokens and parses class body", () => {
    const { tokens } = lex("int x; class D { int a; }");
    const ast = parse(tokens);
    const decl = ast[1] as ClassDeclaration;
    expect(decl.name).toBe("D");
    expect(decl.fields).toEqual([{ name: "a", fieldType: "int", dimensions: [], static: false }]);
  });

  it("handles nested blocks and semicolons", () => {
    const code = "class E { void f() { int y; } };";
    const { tokens } = lex(code);
    const ast = parse(tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.name).toBe("E");
    expect(decl.fields.length).toBe(0);
  });

  it("skips unknown tokens and braces", () => {
    const code = "class F { 42; { int x; } void g(); int a; }";
    const { tokens } = lex(code);
    const ast = parse(tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.fields).toEqual([{ name: "a", fieldType: "int", dimensions: [], static: false }]);
  });

  it("handles nested blocks inside methods", () => {
    const code = "class H { void h() { if(true){ int x; } } int a; }";
    const { tokens } = lex(code);
    const ast = parse(tokens);
    const decl = ast[0] as ClassDeclaration;
    expect(decl.fields).toEqual([{ name: "a", fieldType: "int", dimensions: [], static: false }]);
  });

  it("throws when void is used as field type", () => {
    const { tokens } = lex("class G { void bad; }");
    expect(() => parse(tokens)).toThrow("void type cannot be used for fields");
  });

  it("throws on invalid syntax", () => {
    const { tokens } = lex("enum X {");
    expect(() => parse(tokens)).toThrow();
  });

  it("throws on wrong token type", () => {
    const { tokens } = lex("enum { }");
    expect(() => parse(tokens)).toThrow();
  });

  it("throws on wrong token value", () => {
    const { tokens } = lex("enum X ;");
    expect(() => parse(tokens)).toThrow();
  });

  it("parses global variable declarations", () => {
    const { tokens } = lex("input int Period=14; extern double rate;");
    const ast = parse(tokens);
    const v1 = ast[0] as any;
    const v2 = ast[1] as any;
    expect(v1.type).toBe("VariableDeclaration");
    expect(v1.storage).toBe("input");
    expect(v1.varType).toBe("int");
    expect(v1.name).toBe("Period");
    expect(v1.initialValue).toBe("14");
    expect(v2.storage).toBe("extern");
    expect(v2.name).toBe("rate");
  });

  it("parses control flow statements", () => {
    const { tokens } = lex("for(int i=0;i<1;i++){}");
    const ast = parse(tokens);
    const { type, keyword } = ast[0] as any;
    expect({ type, keyword }).toEqual({ type: "ControlStatement", keyword: "for" });
  });

  it("parses template class and function", () => {
    const code = "template<typename T> class Box {}; template<class U> U max(U a,U b);";
    const ast = parse(lex(code).tokens);
    const cls = ast[0] as any;
    const fn = ast[1] as any;
    expect(cls.templateParams).toEqual(["T"]);
    expect(fn.templateParams).toEqual(["U"]);
  });

  it("parses local variable declarations", () => {
    const { tokens } = lex("void f(){ int a; static double b; }");
    const ast = parse(tokens);
    const fn = ast[0] as any;
    expect(fn.locals.map((v: any) => v.name)).toEqual(["a", "b"]);
    expect(fn.locals[1].storage).toBe("static");
  });
});
