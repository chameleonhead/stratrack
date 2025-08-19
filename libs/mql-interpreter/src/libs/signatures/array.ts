import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/array
export const arrayBuiltinSignatures: BuiltinSignaturesMap = {
  ArrayBsearch: {
    args: [
      { name: "array", type: "any[]" },
      { name: "value", type: "double" },
      { name: "count", type: "int", optional: true },
      { name: "start", type: "int", optional: true },
      { name: "direction", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Returns index of the first found element in the first array dimension",
  },
  ArrayCompare: {
    args: [
      { name: "array1", type: "any[]" },
      { name: "array2", type: "any[]" },
      { name: "count", type: "int", optional: true },
      { name: "start1", type: "int", optional: true },
      { name: "start2", type: "int", optional: true },
    ],
    returnType: "int",
    description:
      "Returns the result of comparing two arrays of simple types or custom structures without complex objects",
  },
  ArrayCopy: [
    {
      args: [
        { name: "dest", type: "any[]" },
        { name: "src", type: "any[]" },
      ],
      returnType: "int",
      description: "Copies one array into another",
    },
    {
      args: [
        { name: "dest", type: "any[]" },
        { name: "src", type: "any[]" },
        { name: "dst_start", type: "int" },
        { name: "src_start", type: "int" },
        { name: "count", type: "int" },
      ],
      returnType: "int",
      description: "Copies one array into another",
    },
  ],
  ArrayCopyRates: {
    args: [
      { name: "dest", type: "MqlRates[]" },
      { name: "symbol", type: "string" },
      { name: "timeframe", type: "int", optional: true },
      { name: "start_pos", type: "int", optional: true },
      { name: "count", type: "int", optional: true },
    ],
    returnType: "int",
    description:
      "Copies rates to the two-dimensional array from chart RateInfo array returns copied bars amount",
  },
  ArrayCopySeries: {
    args: [
      { name: "dest", type: "any[]" },
      { name: "series_index", type: "int" },
      { name: "symbol", type: "string", optional: true },
      { name: "timeframe", type: "int", optional: true },
    ],
    returnType: "int",
    description:
      "Copies a series array to another one and returns the count of the copied elements",
  },
  ArrayDimension: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "int",
    description: "Returns the multidimensional array rank",
  },
  ArrayFill: {
    args: [
      { name: "array", type: "any[]" },
      { name: "value", type: "double" },
      { name: "start", type: "int", optional: true },
      { name: "count", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Fills an array with the specified value",
  },
  ArrayFree: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "int",
    description:
      "Frees up buffer of any dynamic array and sets the size of the zero dimension in 0.",
  },
  ArrayGetAsSeries: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "int",
    description: "Checks direction of array indexing",
  },
  ArrayInitialize: {
    args: [
      { name: "array", type: "any[]" },
      { name: "value", type: "double" },
    ],
    returnType: "int",
    description: "Sets all elements of a numeric array into a single value",
  },
  ArrayIsDynamic: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "bool",
    description: "Checks whether an array is dynamic",
  },
  ArrayIsSeries: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "bool",
    description: "Checks whether an array is a timeseries",
  },
  ArrayMaximum: {
    args: [
      { name: "array", type: "double[]" },
      { name: "count", type: "int", optional: true },
      { name: "start", type: "int", optional: true },
    ],
    returnType: "double",
    description: "Search for an element with the maximal value",
  },
  ArrayMinimum: {
    args: [
      { name: "array", type: "double[]" },
      { name: "count", type: "int", optional: true },
      { name: "start", type: "int", optional: true },
    ],
    returnType: "double",
    description: "Search for an element with the minimal value",
  },
  ArrayRange: {
    args: [
      { name: "array", type: "any[]" },
      { name: "index", type: "int" },
    ],
    returnType: "int",
    description: "Returns the number of elements in the specified dimension of the array",
  },
  ArrayResize: {
    args: [
      { name: "array", type: "any[]" },
      { name: "new_size", type: "int" },
      { name: "reserve_size", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Sets the new size in the first dimension of the array",
  },
  ArraySetAsSeries: {
    args: [
      { name: "array", type: "any[]" },
      { name: "as_series", type: "bool" },
    ],
    returnType: "int",
    description: "Sets the direction of array indexing",
  },
  ArraySize: {
    args: [{ name: "array", type: "any[]" }],
    returnType: "int",
    description: "Returns the number of elements in the array",
  },
  ArraySort: {
    args: [
      { name: "array", type: "any[]" },
      { name: "count", type: "int", optional: true },
      { name: "start", type: "int", optional: true },
      { name: "sort_dir", type: "int", optional: true },
    ],
    returnType: "int",
    description: "Sorting of numeric arrays by the first dimension",
  },
};
