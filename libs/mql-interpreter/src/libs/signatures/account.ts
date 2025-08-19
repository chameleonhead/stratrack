import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/account
export const accountBuiltinSignatures: BuiltinSignaturesMap = {
  AccountBalance: {
    args: [],
    returnType: "double",
    description: "Returns balance value of the current account",
  },
  AccountCompany: {
    args: [],
    returnType: "string",
    description: "Returns the brokerage company name where the current account was registered",
  },
  AccountCredit: {
    args: [],
    returnType: "double",
    description: "Returns credit value of the current account",
  },
  AccountCurrency: {
    args: [],
    returnType: "string",
    description: "Returns currency name of the current account",
  },
  AccountEquity: {
    args: [],
    returnType: "double",
    description: "Returns equity value of the current account",
  },
  AccountFreeMargin: {
    args: [],
    returnType: "double",
    description: "Returns free margin value of the current account",
  },
  AccountFreeMarginCheck: {
    args: [
      { name: "symbol", type: "string" }, // symbol
      { name: "cmd", type: "int" }, // trade operation
      { name: "volume", type: "double" }, // volume
    ],
    returnType: "double",
    description:
      "Returns free margin that remains after the specified position has been opened at the current price on the current account",
  },
  AccountFreeMarginMode: {
    args: [],
    returnType: "int",
    description: "Calculation mode of free margin allowed to open orders on the current account",
  },
  AccountInfoDouble: {
    args: [
      { name: "property_id", type: "int" }, // identifier of the property
    ],
    returnType: "double",
    description: "Returns a value of double type of the corresponding account property",
  },
  AccountInfoInteger: {
    args: [
      { name: "property_id", type: "int" }, // identifier of the property
    ],
    returnType: "long",
    description:
      "Returns a value of integer type (bool, int or long) of the corresponding account property",
  },
  AccountInfoString: {
    args: [
      { name: "property_id", type: "int" }, // identifier of the property
    ],
    returnType: "string",
    description: "Returns a value string type corresponding account property",
  },
  AccountLeverage: {
    args: [],
    returnType: "int",
    description: "Returns leverage of the current account",
  },
  AccountMargin: {
    args: [],
    returnType: "double",
    description: "Returns margin value of the current account",
  },
  AccountName: {
    args: [],
    returnType: "string",
    description: "Returns the current account name",
  },
  AccountNumber: {
    args: [],
    returnType: "long",
    description: "Returns the current account number",
  },
  AccountProfit: {
    args: [],
    returnType: "double",
    description: "Returns profit value of the current account",
  },
  AccountServer: {
    args: [],
    returnType: "string",
    description: "Returns the connected server name",
  },
  AccountStopoutLevel: {
    args: [],
    returnType: "int",
    description: "Returns the value of the Stop Out level",
  },
  AccountStopoutMode: {
    args: [],
    returnType: "int",
    description: "Returns the calculation mode for the Stop Out level",
    // Returned value
    // Returns the calculation mode for the Stop Out level.
    // Calculation mode can take the following values:
    // 0 - calculation of percentage ratio between margin and equity;
    // 1 - comparison of the free margin level to the absolute value.
  },
};
