import { compile } from '../src';
import { describe, it, expect } from 'vitest';

describe('compile errors', () => {
  it('reports unknown types', () => {
    const result = compile('Foo x;');
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
