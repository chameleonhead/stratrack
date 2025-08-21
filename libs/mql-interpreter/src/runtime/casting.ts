import { DateTimeValue } from "./datetimeValue";
import { toInt32, toUInt32, toInt64, toUInt64 } from "./intMath";

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
    case "short":
    case "int":
    case "color":
      return toInt32(value);
    case "uchar":
    case "ushort":
    case "uint":
      return toUInt32(value);
    case "long":
      return toInt64(value);
    case "ulong":
      return toUInt64(value);
    case "datetime":
      return new DateTimeValue(Number(toInt64(value)));
    default:
      throw new Error(`Unknown cast target: ${type}`);
  }
}
