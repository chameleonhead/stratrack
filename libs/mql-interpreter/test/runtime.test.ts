import { lex } from '../src/lexer';
import { parse } from '../src/parser';
import { execute, callFunction } from '../src/runtime';
import { preprocessWithProperties } from '../src/preprocess';
import { describe, it, expect, vi } from 'vitest';

describe('execute', () => {
  it('evaluates enums', () => {
    const tokens = lex('enum Color { Red=1, Green, Blue };');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.enums.Color).toEqual({ Red: 1, Green: 2, Blue: 3 });
  });

  it('stores classes with inheritance when base exists', () => {
    const tokens = lex('class Parent {} class Child : Parent {}');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.Child).toEqual({ base: 'Parent', fields: {}, methods: [] });
  });

  it('stores class fields', () => {
    const tokens = lex('class A { int a; string b; }');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.A).toEqual({
      base: undefined,
      fields: {
        a: { type: 'int', dimensions: [], static: false },
        b: { type: 'string', dimensions: [], static: false },
      },
      methods: [],
    });
  });

  it('stores structs', () => {
    const tokens = lex('struct S { int a; };');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.S.fields.a).toEqual({ type: 'int', dimensions: [], static: false });
  });

  it('stores dynamic array fields', () => {
    const tokens = lex('class A { double arr[]; }');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.A.fields.arr).toEqual({ type: 'double', dimensions: [null], static: false });
  });

  it('stores static and virtual flags', () => {
    const code = 'class S{ static int c; virtual void tick(); static void util(); }';
    const runtime = execute(parse(lex(code)));
    expect(runtime.classes.S.fields.c.static).toBe(true);
    expect(runtime.classes.S.methods[0].virtual).toBe(true);
    expect(runtime.classes.S.methods[1].static).toBe(true);
  });

  it('stores class methods including operators', () => {
    const code = 'class M{int add(int v); double operator+(double b); M();}';
    const runtime = execute(parse(lex(code)));
    const methods = runtime.classes.M.methods;
    expect(methods.map(m => m.name)).toEqual(['add', 'operator+', 'M']);
    expect(methods[0].parameters[0].type).toBe('int');
    expect(methods[1].returnType).toBe('double');
  });

  it('stores functions', () => {
    const tokens = lex('double lin(double a,double b){return a+b;}');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.functions.lin[0].returnType).toBe('double');
    expect(runtime.functions.lin[0].parameters).toEqual([
      { type: 'double', byRef: false, name: 'a', dimensions: [], defaultValue: undefined },
      { type: 'double', byRef: false, name: 'b', dimensions: [], defaultValue: undefined },
    ]);
  });

  it('stores reference parameter info', () => {
    const tokens = lex('void modify(int &ref, double vals[]);');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.functions.modify[0].parameters).toEqual([
      { type: 'int', byRef: true, name: 'ref', dimensions: [], defaultValue: undefined },
      { type: 'double', byRef: false, name: 'vals', dimensions: [null], defaultValue: undefined },
    ]);
  });

  it('stores overloaded functions', () => {
    const tokens = lex('void f(); void f(int a);');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.functions.f.length).toBe(2);
  });


  it('throws when base class is missing', () => {
    const tokens = lex('class Child : Parent {}');
    const ast = parse(tokens);
    expect(() => execute(ast)).toThrowError('Base class Parent not found');
  });

  it('ignores control flow statements', () => {
    const code =
      'for(int i=0;i<1;i++){continue;} while(true){break;} do{}while(false); switch(1){case 1: break; default: break;}';
    const runtime = execute(parse(lex(code)));
    expect(runtime).toEqual({ enums: {}, classes: {}, functions: {}, variables: {}, properties: {}, staticLocals: {} });
  });

  it('handles visibility specifiers', () => {
    const code = 'class A{public: int x; private: int y;} struct S{private: int a; public: int b;}';
    const runtime = execute(parse(lex(code)));
    expect(Object.keys(runtime.classes.A.fields)).toEqual(['x', 'y']);
    expect(Object.keys(runtime.classes.S.fields)).toEqual(['a', 'b']);
  });

  it('stores global variables', () => {
    const code = 'static double g; input int period=10;';
    const runtime = execute(parse(lex(code)));
    expect(runtime.variables.g.storage).toBe('static');
    expect(runtime.variables.period.storage).toBe('input');
    expect(runtime.variables.period.initialValue).toBe('10');
  });

  it('executes entry point builtin', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const runtime = execute([], { entryPoint: 'Print' });
    expect(runtime.enums).toEqual({});
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('passes arguments to entry point', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    execute([], { entryPoint: 'Print', args: ['a', 1] });
    expect(spy).toHaveBeenCalledWith('a', 1);
    spy.mockRestore();
  });

  it('throws when entry point missing', () => {
    expect(() => execute([], { entryPoint: 'Unknown' })).toThrow('Function Unknown not found');
  });

  it('resolves extern variables across files', () => {
    const code = '#import "defs.mqh"\n#import\nextern int E;';
    const { tokens } = preprocessWithProperties(code, {
      fileProvider: (p) => (p === 'defs.mqh' ? 'int E;' : undefined),
    });
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.variables.E.type).toBe('int');
  });

  it('throws when extern variable missing', () => {
    const tokens = lex('extern int E;');
    const ast = parse(tokens);
    expect(() => execute(ast)).toThrow('Extern variable E not defined');
  });

  it('initializes and preserves static locals', () => {
    const tokens = lex('void f(){ static int c=1; }');
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.staticLocals.f).toBeUndefined();
    expect(() => callFunction(runtime, 'f')).toThrow('Function f has no implementation');
    expect(runtime.staticLocals.f.c).toBe(1);
    runtime.staticLocals.f.c = 5;
    expect(() => callFunction(runtime, 'f')).toThrow('Function f has no implementation');
    expect(runtime.staticLocals.f.c).toBe(5);
  });
});
