import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/convert
export const convertBuiltinSignatures: BuiltinSignaturesMap = {
  CharArrayToString: {
    args: [{ name: "array", type: "char[]", optional: false }],
    returnType: "string",
    description: "Converting symbol code (ansi) into one-symbol array",
  },
  CharToStr: {
    args: [{ name: "char", type: "char", optional: false }],
    returnType: "string",
    description: "Conversion of the symbol code into a one-character string",
  },
  CharToString: {
    args: [{ name: "char", type: "char", optional: false }],
    returnType: "string",
    description: "Converting a symbol code into a one-character string",
  },
  ColorToARGB: {
    args: [{ name: "color", type: "color", optional: false }],
    returnType: "uint",
    description: "Converting color type to uint type to receive ARGB representation of the color.",
  },
  ColorToString: {
    args: [{ name: "color", type: "color", optional: false }],
    returnType: "string",
    description: 'Converting color value into string as "R,G,B"',
  },
  DoubleToStr: {
    args: [{ name: "value", type: "double", optional: false }],
    returnType: "string",
    description:
      "Returns text string with the specified numerical value converted into a specified precision format",
  },
  DoubleToString: {
    args: [
      { name: "value", type: "double", optional: false },
      { name: "digits", type: "int", optional: true }
    ],
    returnType: "string",
    description: "Converting a numeric value to a text line with a specified accuracy",
  },
  EnumToString: {
    args: [{ name: "enum", type: "enum", optional: false }],
    returnType: "string",
    description: "Converting an enumeration value of any type to string",
  },
  TypeBFLC: {
    args: [{ name: "value", type: "int", optional: false }],
    returnType: "int", 
    description: "Cast value to TypeBFLC enum",
  },
  FirstPositiontype: {
    args: [{ name: "value", type: "int", optional: false }],
    returnType: "int",
    description: "Cast value to FirstPositiontype enum", 
  },
  IntegerToString: {
    args: [
      { name: "value", type: "int", optional: false },
      { name: "str_len", type: "int", optional: true },
      { name: "fill_char", type: "int", optional: true }
    ],
    returnType: "string",
    description: "Converting int into a string of preset length",
  },
  NormalizeDouble: {
    args: [
      { name: "value", type: "double", optional: false },
      { name: "digits", type: "int", optional: false },
    ],
    returnType: "double",
    description: "Rounding of a floating point number to a specified accuracy",
  },
  ShortArrayToString: {
    args: [{ name: "array", type: "short[]", optional: false }],
    returnType: "string",
    description: "Copying array part into a string",
  },
  ShortToString: {
    args: [{ name: "short", type: "short", optional: false }],
    returnType: "string",
    description: "Converting symbol code (unicode) into one-symbol string",
  },
  StringFormat: {
    args: [
      { name: "format", type: "string", optional: false },
      { name: "args", type: "any", variadic: true, optional: true }
    ],
    returnType: "string",
    description: "Converting number into string according to preset format",
  },
  StringToCharArray: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "uchar[]",
    description:
      "Symbol-wise copying a string converted from Unicode to ANSI, to a selected place of array of uchar type",
  },
  StringToColor: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "color",
    description: 'Converting "R,G,B" string or string with color name into color type value',
  },
  StringToDouble: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "double",
    description:
      "Converting a string containing a symbol representation of number into number of double type",
  },
  StringToInteger: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "int",
    description:
      "Converting a string containing a symbol representation of number into number of int type",
  },
  StringToShortArray: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "ushort[]",
    description: "Symbol-wise copying a string to a selected part of array of ushort type",
  },
  StringToTime: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "datetime",
    description:
      'Converting a string containing time or date in "yyyy.mm.dd [hh:mi]" format into datetime type',
  },
  StrToDouble: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "double",
    description: "Converts string representation of number to double type",
  },
  StrToInteger: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "int",
    description:
      "Converts string containing the value character representation into a value of the integer type",
  },
  StrToTime: {
    args: [{ name: "string", type: "string", optional: false }],
    returnType: "datetime",
    description: 'Converts string in the format "yyyy.mm.dd hh:mi" to datetime type',
  },
  TimeToStr: {
    args: [{ name: "datetime", type: "datetime", optional: false }],
    returnType: "string",
    description: 'Converts value of datetime type into a string of "yyyy.mm.dd hh:mi" format',
  },
  TimeToString: {
    args: [
      { name: "time", type: "datetime", optional: false },
      { name: "mode", type: "int", optional: true }
    ],
    returnType: "string",
    description:
      'Converting a value containing time in seconds elapsed since 01.01.1970 into a string of "yyyy.mm.dd hh:mi" format',
  },
};
