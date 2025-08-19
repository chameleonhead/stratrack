import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/strings
export const stringsBuiltinSignatures: BuiltinSignaturesMap = {
  StringAdd: {
    args: [
      { name: "string_var", type: "string" },
      { name: "add_substring", type: "string" },
    ],
    returnType: "bool",
    description: "Adds a string to the end of another string",
  },
  StringBufferLen: {
    args: [{ name: "string_var", type: "string" }],
    returnType: "int",
    description: "Returns the size of buffer allocated for the string",
  },
  StringCompare: {
    args: [
      { name: "string1", type: "string" },
      { name: "string2", type: "string" },
      { name: "case_sensitive", type: "bool", optional: true },
    ],
    returnType: "int",
    description:
      "Compares two strings and returns 1 if the first string is greater than the second; 0 - if the strings are equal; -1 (minus 1) - if the first string is less than the second one",
  },
  StringConcatenate: {
    args: [
      { name: "first", type: "any" },
      { name: "args", type: "any", variadic: true },
    ],
    returnType: "string",
    description: "Forms a string of parameters passed",
  },
  StringFill: {
    args: [
      { name: "string_var", type: "string" },
      { name: "character", type: "ushort" },
    ],
    returnType: "bool",
    description: "Fills out a specified string by selected symbols",
  },
  StringFind: {
    args: [
      { name: "string_value", type: "string" },
      { name: "match_substring", type: "string" },
      { name: "start_pos", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Search for a substring in a string",
  },
  StringGetChar: {
    args: [
      { name: "string_value", type: "string" },
      { name: "pos", type: "int" },
    ],
    returnType: "ushort",
    description: "Returns character (code) from the specified position in the string",
  },
  StringGetCharacter: {
    args: [
      { name: "string_value", type: "string" },
      { name: "pos", type: "int" },
    ],
    returnType: "ushort",
    description: "Returns the value of a number located in the specified string position",
  },
  StringInit: {
    args: [
      { name: "string_var", type: "string" },
      { name: "len", type: "int" },
      { name: "character", type: "ushort" },
    ],
    returnType: "bool",
    description: "Initializes string by specified symbols and provides the specified string length",
  },
  StringLen: {
    args: [{ name: "string_var", type: "string" }],
    returnType: "int",
    description: "Returns the number of symbols in a string",
  },
  StringReplace: {
    args: [
      { name: "str", type: "string" },
      { name: "find", type: "string" },
      { name: "replacement", type: "string" },
    ],
    returnType: "int",
    description: "Replaces all the found substrings of a string by a set sequence of symbols",
  },
  StringSetChar: {
    args: [
      { name: "string_var", type: "string" },
      { name: "pos", type: "int" },
      { name: "value", type: "ushort" },
    ],
    returnType: "string",
    description: "Returns the string copy with changed character in the specified position",
  },
  StringSetCharacter: {
    args: [
      { name: "string_var", type: "string" },
      { name: "pos", type: "int" },
      { name: "character", type: "ushort" },
    ],
    returnType: "bool",
    description: "Returns true is a symbol is successfully inserted to the passed string.",
  },
  StringSplit: {
    args: [
      { name: "string_value", type: "string" },
      { name: "separator", type: "ushort" },
      { name: "result", type: "string[]" },
    ],
    returnType: "int",
    description:
      "Gets substrings by a specified separator from the specified string, returns the number of substrings obtained",
  },
  StringSubstr: {
    args: [
      { name: "string_value", type: "string" },
      { name: "start_pos", type: "int" },
      { name: "length", type: "int", optional: true },
    ],
    returnType: "string",
    description: "Extracts a substring from a text string starting from a specified position",
  },
  StringToLower: {
    args: [{ name: "string_var", type: "string" }],
    returnType: "bool",
    description: "Transforms all symbols of a selected string to lowercase by location",
  },
  StringToUpper: {
    args: [{ name: "string_var", type: "string" }],
    returnType: "bool",
    description: "Transforms all symbols of a selected string into capitals by location",
  },
  StringTrimLeft: {
    args: [{ name: "text", type: "string" }],
    returnType: "string",
    description: "Cuts line feed characters, spaces and tabs in the left part of the string",
  },
  StringTrimRight: {
    args: [{ name: "text", type: "string" }],
    returnType: "string",
    description: "Cuts line feed characters, spaces and tabs in the right part of the string",
  },
};
