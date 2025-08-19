import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/objects
export const objectsBuiltinSignatures: BuiltinSignaturesMap = {
  ObjectCreate: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "object_type", type: "int" },
      { name: "sub_window", type: "int" },
      { name: "time1", type: "datetime" },
      { name: "price1", type: "double" },
      { name: "time2", type: "datetime", optional: true },
      { name: "price2", type: "double", optional: true },
      { name: "time3", type: "datetime", optional: true },
      { name: "price3", type: "double", optional: true },
    ],
    returnType: "bool",
    description: "Creates an object of the specified type in a specified chart",
  },
  ObjectDelete: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
    ],
    returnType: "bool",
    description: "Removes the object having the specified name",
  },
  ObjectDescription: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
    ],
    returnType: "string",
    description: "Returns the object description",
  },
  ObjectFind: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
    ],
    returnType: "int",
    description: "Searches for an object having the specified name",
  },
  ObjectGet: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "index", type: "int" },
    ],
    returnType: "double",
    description: "Returns the value of the specified object property",
  },
  ObjectGetDouble: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "prop_id", type: "int" },
      { name: "prop_modifier", type: "int", optional: true },
    ],
    returnType: "double",
    description: "Returns the double value of the corresponding object property",
  },
  ObjectGetFiboDescription: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "index", type: "int" },
    ],
    returnType: "string",
    description: "Returns the level description of a Fibonacci object",
  },
  ObjectGetInteger: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "prop_id", type: "int" },
      { name: "prop_modifier", type: "int", optional: true },
    ],
    returnType: "long",
    description: "Returns the integer value of the corresponding object property",
  },
  ObjectGetShiftByValue: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "value", type: "double" },
    ],
    returnType: "int",
    description: "Calculates and returns bar index for the given price",
  },
  ObjectGetString: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "prop_id", type: "int" },
      { name: "prop_modifier", type: "int", optional: true },
    ],
    returnType: "string",
    description: "Returns the string value of the corresponding object property",
  },
  ObjectGetTimeByValue: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "value", type: "double" },
      { name: "line_id", type: "int", optional: true },
    ],
    returnType: "datetime",
    description: "Returns the time value for the specified object price value",
  },
  ObjectGetValueByShift: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "shift", type: "int" },
    ],
    returnType: "double",
    description: "Calculates and returns the price value for the specified bar",
  },
  ObjectGetValueByTime: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "time", type: "datetime" },
      { name: "line_id", type: "int", optional: true },
    ],
    returnType: "double",
    description: "Returns the price value of an object for the specified time",
  },
  ObjectMove: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "point_index", type: "int" },
      { name: "time", type: "datetime" },
      { name: "price", type: "double" },
    ],
    returnType: "bool",
    description: "Changes the coordinates of the specified object anchor point",
  },
  ObjectName: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "index", type: "int" },
    ],
    returnType: "string",
    description: "Returns the name of an object by its index in the objects list",
  },
  ObjectsDeleteAll: [
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "sub_window", type: "int", optional: true },
        { name: "object_type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Removes all objects of the specified type from the specified chart subwindow",
    },
    {
      args: [
        { name: "sub_window", type: "int", optional: true },
        { name: "object_type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Removes all objects of the specified type from the specified chart subwindow",
    },
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "prefix", type: "string" },
        { name: "sub_window", type: "int", optional: true },
        { name: "object_type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Removes all objects of the specified type from the specified chart subwindow",
    },
    {
      args: [
        { name: "prefix", type: "string" },
        { name: "sub_window", type: "int", optional: true },
        { name: "object_type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Removes all objects of the specified type from the specified chart subwindow",
    },
  ],
  ObjectSet: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "index", type: "int" },
      { name: "value", type: "double" },
    ],
    returnType: "bool",
    description: "Changes the value of the specified object property",
  },
  ObjectSetDouble: [
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "value", type: "double" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "prop_modifier", type: "int" },
        { name: "value", type: "double" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
  ],
  ObjectSetFiboDescription: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "index", type: "int" },
      { name: "text", type: "string" },
    ],
    returnType: "bool",
    description: "Sets a new description to a level of a Fibonacci object",
  },
  ObjectSetInteger: [
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "value", type: "long" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "prop_modifier", type: "int" },
        { name: "value", type: "long" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
  ],
  ObjectSetString: [
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "value", type: "string" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
    {
      args: [
        { name: "chart_id", type: "long", optional: true },
        { name: "object_name", type: "string" },
        { name: "prop_id", type: "int" },
        { name: "prop_modifier", type: "int" },
        { name: "value", type: "string" },
      ],
      returnType: "bool",
      description: "Sets the value of the corresponding object property",
    },
  ],
  ObjectSetText: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
      { name: "text", type: "string" },
      { name: "font_size", type: "int", optional: true },
      { name: "font_name", type: "string", optional: true },
      { name: "text_color", type: "color", optional: true },
    ],
    returnType: "bool",
    description: "Changes the object description",
  },
  ObjectsTotal: [
    {
      args: [
        { name: "chart_id", type: "long" },
        { name: "sub_window", type: "int", optional: true },
        { name: "type", type: "int", optional: true },
      ],
      returnType: "int",
      description: "Returns the number of objects of the specified type",
    },
    {
      args: [{ name: "type", type: "int", optional: true }],
      returnType: "int",
      description: "Returns the number of objects of the specified type",
    },
  ],
  ObjectType: {
    args: [
      { name: "chart_id", type: "long", optional: true },
      { name: "object_name", type: "string" },
    ],
    returnType: "int",
    description: "Returns the object type",
  },
  TextGetSize: {
    args: [
      { name: "text", type: "string" },
      { name: "width", type: "uint" },
      { name: "height", type: "uint" },
    ],
    returnType: "bool",
    description: "Returns the string's width and height at the current font settings",
  },
  TextOut: {
    args: [
      { name: "text", type: "string" },
      { name: "x", type: "int" },
      { name: "y", type: "int" },
      { name: "anchor", type: "uint" },
      { name: "data", type: "uint[]" },
      { name: "width", type: "uint" },
      { name: "height", type: "uint" },
      { name: "color", type: "uint" },
      { name: "color_format", type: "int" },
    ],
    returnType: "bool",
    description:
      "Transfers the text to the custom array (buffer) designed for creation of a graphical resource",
  },
  TextSetFont: {
    args: [
      { name: "name", type: "string" },
      { name: "size", type: "int" },
      { name: "flags", type: "uint", optional: true },
      { name: "orientation", type: "int", optional: true },
    ],
    returnType: "bool",
    description:
      "Sets the font for displaying the text using drawing methods (Arial 20 used by default)",
  },
};
