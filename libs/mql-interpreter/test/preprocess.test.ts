import { preprocess, preprocessWithProperties } from '../src/preprocess';
import { parse } from '../src/parser';
import { execute } from '../src/runtime';
import { describe, it, expect } from 'vitest';

describe('preprocess', () => {
  it('expands defined constants', () => {
    const code = '#define SIZE 5\nclass A { int arr[SIZE]; }';
    const tokens = preprocess(code);
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(runtime.classes.A.fields.arr).toEqual({ type: 'int', dimensions: [5] });
  });

  it('supports undef', () => {
    const code = '#define A 1\n#undef A\nclass B { int v=A; }';
    const tokens = preprocess(code);
    const ast = parse(tokens);
    const runtime = execute(ast);
    // A should remain identifier since it was undefined
    expect(Object.keys(runtime.classes)).toEqual(['B']);
  });

  it('captures program properties', () => {
    const code = '#property version "1.0"\nclass A{}';
    const { tokens, properties } = preprocessWithProperties(code);
    const ast = parse(tokens);
    const runtime = execute(ast);
    expect(properties.version).toEqual(['"1.0"']);
    expect(Object.keys(runtime.classes)).toEqual(['A']);
  });
});
