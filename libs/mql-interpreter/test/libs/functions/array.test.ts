import {
  ArrayResize,
  ArrayCopy,
  ArraySetAsSeries,
  ArrayGetAsSeries,
  ArrayIsSeries,
  ArraySize,
  ArrayRange,
  ArrayDimension,
  ArrayFree,
  ArrayInitialize,
  ArrayFill,
  ArraySort,
  ArrayMaximum,
  ArrayMinimum,
  ArrayBsearch,
  ArrayCompare,
} from "../../../src/libs/functions/array";
import { describe, it, expect } from "vitest";

describe("array builtins", () => {
  it("ArrayResize grows array with default value", () => {
    const arr = [1, 2];
    ArrayResize(arr, 4, 0);
    expect(arr).toEqual([1, 2, 0, 0]);
  });

  it("ArrayResize shrinks array", () => {
    const arr = [1, 2, 3];
    ArrayResize(arr, 1);
    expect(arr).toEqual([1]);
  });

  it("ArrayCopy copies items", () => {
    const src = [1, 2, 3];
    const dst: number[] = [];
    ArrayCopy(dst, src, 1, 2);
    expect(dst).toEqual([2, 3]);
  });

  it("ArraySetAsSeries flags array", () => {
    const arr: any[] = [];
    ArraySetAsSeries(arr, true);
    expect((arr as any).__asSeries).toBe(true);
  });

  it("ArrayGetAsSeries and ArrayIsSeries reflect flag", () => {
    const arr: any[] = [];
    expect(ArrayIsSeries(arr)).toBe(0);
    ArraySetAsSeries(arr, true);
    expect(ArrayGetAsSeries(arr)).toBe(1);
    expect(ArrayIsSeries(arr)).toBe(1);
  });

  it("ArraySize and Range and Dimension work", () => {
    const arr = [
      [1, 2],
      [3, 4],
    ];
    expect(ArraySize(arr)).toBe(2);
    expect(ArrayRange(arr, 0)).toBe(2);
    expect(ArrayRange(arr, 1)).toBe(2);
    expect(ArrayDimension(arr)).toBe(2);
  });

  it("ArrayFree and Initialize clear and set values", () => {
    const arr = [1, 2, 3];
    ArrayInitialize(arr, 5);
    expect(arr).toEqual([5, 5, 5]);
    ArrayFree(arr);
    expect(arr.length).toBe(0);
  });

  it("ArrayFill fills subset", () => {
    const arr = [0, 0, 0];
    ArrayFill(arr, 1, 2, 9);
    expect(arr).toEqual([0, 9, 9]);
  });

  it("ArraySort sorts ascending and descending", () => {
    const arr = [3, 1, 2];
    ArraySort(arr);
    expect(arr).toEqual([1, 2, 3]);
    ArraySort(arr, 1);
    expect(arr).toEqual([3, 2, 1]);
  });

  it("ArrayMaximum and Minimum find index", () => {
    const arr = [5, 2, 8, 1];
    expect(ArrayMaximum(arr)).toBe(2);
    expect(ArrayMinimum(arr)).toBe(3);
  });

  it("ArrayBsearch finds element or returns -1", () => {
    const arr = [1, 3, 5, 7];
    expect(ArrayBsearch(arr, 5)).toBe(2);
    expect(ArrayBsearch(arr, 4)).toBe(-1);
  });

  it("ArrayCompare compares ranges", () => {
    const a = [1, 2, 3];
    const b = [1, 2, 4];
    expect(ArrayCompare(a, b)).toBe(-1);
    expect(ArrayCompare(b, a)).toBe(1);
    expect(ArrayCompare(a, [1, 2, 3])).toBe(0);
  });
});
