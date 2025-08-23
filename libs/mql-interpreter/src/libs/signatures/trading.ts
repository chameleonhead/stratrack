import { BuiltinSignaturesMap } from "./types";

// https://docs.mql4.com/trading
export const tradingBuiltinSignatures: BuiltinSignaturesMap = {
  OrderClose: {
    args: [
      { name: "ticket", type: "int" },
      { name: "lots", type: "double" },
      { name: "price", type: "double" },
      { name: "slippage", type: "int", optional: true },
      { name: "arrow_color", type: "color", optional: true },
    ],
    returnType: "bool",
    description: "Closes opened order",
  },
  OrderCloseBy: {
    args: [
      { name: "ticket", type: "int" },
      { name: "opposite", type: "int" },
      { name: "arrow_color", type: "color", optional: true },
    ],
    returnType: "bool",
    description: "Closes an opened order by another opposite opened order",
  },
  OrderClosePrice: {
    args: [],
    returnType: "double",
    description: "Returns close price of the currently selected order",
  },
  OrderCloseTime: {
    args: [],
    returnType: "datetime",
    description: "Returns close time of the currently selected order",
  },
  OrderComment: {
    args: [],
    returnType: "string",
    description: "Returns comment of the currently selected order",
  },
  OrderCommission: {
    args: [],
    returnType: "double",
    description: "Returns calculated commission of the currently selected order",
  },
  OrderDelete: {
    args: [
      { name: "ticket", type: "int" },
      { name: "arrow_color", type: "color", optional: true },
    ],
    returnType: "bool",
    description: "Deletes previously opened pending order",
  },
  OrderExpiration: {
    args: [],
    returnType: "datetime",
    description: "Returns expiration date of the selected pending order",
  },
  OrderLots: {
    args: [],
    returnType: "double",
    description: "Returns amount of lots of the selected order",
  },
  OrderMagicNumber: {
    args: [],
    returnType: "int",
    description: "Returns an identifying (magic) number of the currently selected order",
  },
  OrderModify: {
    args: [
      { name: "ticket", type: "int" },
      { name: "price", type: "double" },
      { name: "stoploss", type: "double" },
      { name: "takeprofit", type: "double" },
      { name: "expiration", type: "datetime", optional: true },
      { name: "arrow_color", type: "color", optional: true },
    ],
    returnType: "bool",
    description: "Modification of characteristics of the previously opened or pending orders",
  },
  OrderOpenPrice: {
    args: [],
    returnType: "double",
    description: "Returns open price of the currently selected order",
  },
  OrderOpenTime: {
    args: [],
    returnType: "datetime",
    description: "Returns open time of the currently selected order",
  },
  OrderPrint: {
    args: [],
    returnType: "void",
    description: "Prints information about the selected order in the log",
  },
  OrderProfit: {
    args: [],
    returnType: "double",
    description: "Returns profit of the currently selected order",
  },
  OrderSelect: {
    args: [
      { name: "index", type: "int" },
      { name: "select", type: "int" },
      { name: "pool", type: "int", optional: true },
    ],
    returnType: "bool",
    description: "The function selects an order for further processing",
  },
  OrderSend: {
    args: [
      { name: "symbol", type: "string" },
      { name: "cmd", type: "int" },
      { name: "volume", type: "double" },
      { name: "price", type: "double" },
      { name: "slippage", type: "int" },
      { name: "stoploss", type: "double" },
      { name: "takeprofit", type: "double" },
      { name: "comment", type: "string", optional: true },
      { name: "magic", type: "int", optional: true },
      { name: "expiration", type: "datetime", optional: true },
      { name: "arrow_color", type: "color", optional: true },
    ],
    returnType: "int",
    description: "The main function used to open an order or place a pending order",
  },
  HistoryTotal: {
    args: [],
    returnType: "int",
    description: "Returns the total amount of closed orders in the account history",
  },
  OrdersHistoryTotal: {
    args: [],
    returnType: "int",
    description:
      "Returns the number of closed orders in the account history loaded into the terminal",
  },
  OrderStopLoss: {
    args: [],
    returnType: "double",
    description: "Returns stop loss value of the currently selected order",
  },
  OrdersTotal: {
    args: [],
    returnType: "int",
    description: "Returns the number of market and pending orders",
  },
  OrderSwap: {
    args: [],
    returnType: "double",
    description: "Returns swap value of the currently selected order",
  },
  OrderSymbol: {
    args: [],
    returnType: "string",
    description: "Returns symbol name of the currently selected order",
  },
  OrderTakeProfit: {
    args: [],
    returnType: "double",
    description: "Returns take profit value of the currently selected order",
  },
  OrderTicket: {
    args: [],
    returnType: "int",
    description: "Returns ticket number of the currently selected order",
  },
  OrderType: {
    args: [],
    returnType: "int",
    description: "Returns order operation type of the currently selected order",
  },
};
