import { DateTimeValue } from "./datetimeValue.js";

export type PrimitiveType =
  | "char"
  | "uchar"
  | "short"
  | "ushort"
  | "int"
  | "uint"
  | "long"
  | "ulong"
  | "float"
  | "double"
  | "bool"
  | "color"
  | "datetime"
  | "string";

// Perform a very simplified cast between primitive types.
export function cast(value: any, type: PrimitiveType): any {
  switch (type) {
    case "string":
      return String(value);
    case "bool":
      return value ? 1 : 0;
    case "float":
    case "double":
      return Number(value);
    case "char":
    case "uchar":
    case "short":
    case "ushort":
    case "int":
    case "uint":
    case "long":
    case "ulong":
    case "color":
      return Number(value) | 0;
    case "datetime":
      return new DateTimeValue(Number(value) | 0);
    default:
      throw new Error(`Unknown cast target: ${type}`);
  }
}
