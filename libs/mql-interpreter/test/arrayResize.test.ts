import { resizeArray } from '../src/resizeArray';
import { describe, it, expect } from 'vitest';

describe('ArrayResize', () => {
  it('grows array with default value', () => {
    const arr = [1, 2];
    resizeArray(arr, 4, 0);
    expect(arr).toEqual([1, 2, 0, 0]);
  });

  it('shrinks array', () => {
    const arr = [1, 2, 3];
    resizeArray(arr, 1);
    expect(arr).toEqual([1]);
  });
});
