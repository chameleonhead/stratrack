import { interpret } from '../src';
import { describe, it, expect } from 'vitest';

describe('interpret', () => {
  it('runs without throwing', () => {
    expect(() => interpret('')).not.toThrow();
  });
});

