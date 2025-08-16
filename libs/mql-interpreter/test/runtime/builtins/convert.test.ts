import {
  CharToString,
  CharArrayToString,
  StringToCharArray,
  StringFormat,
  StringToTime,
  TimeToString,
  DoubleToString,
  StringToDouble,
  IntegerToString,
  StringToInteger,
  NormalizeDouble,
} from "../../../src/libs/builtins/convert";
import { describe, it, expect } from "vitest";

describe("convert builtins", () => {
  it("CharToString converts numbers and strings", () => {
    expect(CharToString(65)).toBe("A");
    expect(CharToString("xyz")).toBe("x");
  });

  it("StringToTime parses dates", () => {
    const ts = StringToTime("1970-01-01T00:00:01Z");
    expect(ts).toBe(1);
  });

  it("TimeToString formats timestamp", () => {
    expect(TimeToString(0)).toBe("1970-01-01T00:00:00.000Z");
  });

  it("DoubleToString and StringToDouble convert numbers", () => {
    const str = DoubleToString(1.2345, 2);
    expect(str).toBe("1.23");
    expect(StringToDouble(str)).toBe(1.23);
  });

  it("IntegerToString and StringToInteger convert integers", () => {
    const str = IntegerToString(255, 16);
    expect(str).toBe("ff");
    expect(StringToInteger(str, 16)).toBe(255);
  });

  it("StringFormat behaves like util.format", () => {
    expect(StringFormat("a%sb", 1)).toBe("a1b");
  });

  it("StringToCharArray and CharArrayToString round trip", () => {
    const buf: number[] = [];
    StringToCharArray("abc", buf);
    expect(buf).toEqual([97, 98, 99]);
    const str = CharArrayToString(buf);
    expect(str).toBe("abc");
  });

  it("NormalizeDouble rounds values", () => {
    expect(NormalizeDouble(1.23456, 2)).toBe(1.23);
  });
});
