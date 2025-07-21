import { interpret } from '../src';
import { describe, it, expect } from 'vitest';

describe('interpret', () => {
  it('runs without throwing', () => {
    expect(() => interpret('')).not.toThrow();
  });

  it('returns properties from interpret', () => {
    const result = interpret('#property copyright "test"');
    expect(result.properties).toEqual({ copyright: ['"test"'] });
  });
});

