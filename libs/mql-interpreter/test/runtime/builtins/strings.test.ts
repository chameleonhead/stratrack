import {
  StringLen,
  StringSubstr,
  StringTrimLeft,
  StringTrimRight,
  StringAdd,
  StringBufferLen,
  StringCompare,
  StringConcatenate,
  StringFill,
  StringFind,
  StringGetChar,
  StringSetChar,
  StringInit,
  StringReplace,
  StringSplit,
  StringToLower,
  StringToUpper,
} from "../../../src/runtime/builtins/strings";
import { describe, it, expect } from "vitest";

describe("string builtins", () => {
  it("StringLen returns length", () => {
    expect(StringLen("abc")).toBe(3);
  });

  it("StringSubstr extracts substring", () => {
    expect(StringSubstr("hello", 1, 3)).toBe("ell");
  });

  it("StringTrimLeft removes leading spaces", () => {
    const obj = { value: "  test" };
    StringTrimLeft(obj);
    expect(obj.value).toBe("test");
  });

  it("StringTrimRight removes trailing spaces", () => {
    const obj = { value: "test  " };
    StringTrimRight(obj);
    expect(obj.value).toBe("test");
  });

  it("StringAdd appends string", () => {
    const obj = { value: "foo" };
    expect(StringAdd(obj, "bar")).toBe(true);
    expect(obj.value).toBe("foobar");
  });

  it("StringBufferLen returns length", () => {
    expect(StringBufferLen("abc")).toBe(3);
  });

  it("StringCompare compares case sensitivity", () => {
    expect(StringCompare("a", "b")).toBe(-1);
    expect(StringCompare("a", "A", false)).toBe(0);
  });

  it("StringConcatenate joins values", () => {
    expect(StringConcatenate("a", 1, "b")).toBe("a1b");
  });

  it("StringFill fills with char", () => {
    const obj = { value: "abc" };
    StringFill(obj, "x".charCodeAt(0));
    expect(obj.value).toBe("xxx");
  });

  it("StringFind locates substring", () => {
    expect(StringFind("hello", "ell")).toBe(1);
    expect(StringFind("hello", "zz")).toBe(-1);
  });

  it("StringGetChar returns char code", () => {
    expect(StringGetChar("abc", 1)).toBe("b".charCodeAt(0));
    expect(StringGetChar("abc", 5)).toBe(-1);
  });

  it("StringSetChar replaces at position", () => {
    const obj = { value: "abc" };
    expect(StringSetChar(obj, 1, "x".charCodeAt(0))).toBe(true);
    expect(obj.value).toBe("axc");
  });

  it("StringInit sets length and char", () => {
    const obj = { value: "" };
    StringInit(obj, 3, "y".charCodeAt(0));
    expect(obj.value).toBe("yyy");
  });

  it("StringReplace replaces substrings", () => {
    const obj = { value: "abab" };
    expect(StringReplace(obj, "ab", "c")).toBe(2);
    expect(obj.value).toBe("cc");
  });

  it("StringSplit splits into array", () => {
    const result: string[] = [];
    expect(StringSplit("a,b,c", ",".charCodeAt(0), result)).toBe(3);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("StringToLower and StringToUpper convert case", () => {
    expect(StringToLower("AbC")).toBe("abc");
    expect(StringToUpper("AbC")).toBe("ABC");
  });
});
