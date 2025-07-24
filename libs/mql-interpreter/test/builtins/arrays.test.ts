import { ArrayResize, ArrayCopy, ArraySetAsSeries } from '../../src/builtins/impl/array';
import { describe, it, expect } from 'vitest';

describe('array builtins', () => {
  it('ArrayResize grows array with default value', () => {
    const arr = [1, 2];
    ArrayResize(arr, 4, 0);
    expect(arr).toEqual([1, 2, 0, 0]);
  });

  it('ArrayResize shrinks array', () => {
    const arr = [1, 2, 3];
    ArrayResize(arr, 1);
    expect(arr).toEqual([1]);
  });

  it('ArrayCopy copies items', () => {
    const src = [1, 2, 3];
    const dst: number[] = [];
    ArrayCopy(dst, src, 1, 2);
    expect(dst).toEqual([2, 3]);
  });

  it('ArraySetAsSeries flags array', () => {
    const arr: any[] = [];
    ArraySetAsSeries(arr, true);
    expect((arr as any).__asSeries).toBe(true);
  });
});
