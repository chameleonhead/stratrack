export type MqlLibraryName =
  | "AccountBalance"
  | "AccountCompany"
  | "AccountCredit"
  | "AccountCurrency"
  | "AccountEquity"
  | "AccountFreeMargin"
  | "AccountFreeMarginCheck"
  | "AccountFreeMarginMode"
  | "AccountInfoDouble"
  | "AccountInfoInteger"
  | "AccountInfoString"
  | "AccountLeverage"
  | "AccountMargin"
  | "AccountName"
  | "AccountNumber"
  | "AccountProfit"
  | "AccountServer"
  | "AccountStopoutLevel"
  | "AccountStopoutMode"
  | "Bars"
  | "iBars"
  | "iBarShift"
  | "iOpen"
  | "iHigh"
  | "iLow"
  | "iClose"
  | "iTime"
  | "iVolume"
  | "CopyRates"
  | "CopyTime"
  | "CopyOpen"
  | "CopyHigh"
  | "CopyLow"
  | "CopyClose"
  | "CopyTickVolume"
  | "SeriesInfoInteger"
  | "RefreshRates"
  | "ResetLastError"
  | "IndicatorBuffers"
  | "SetIndexBuffer"
  | "SetIndexLabel"
  | "SetIndexShift"
  | "IndicatorCounted"
  | "IndicatorDigits"
  | "IndicatorSetDouble"
  | "IndicatorSetInteger"
  | "IndicatorSetString"
  | "IndicatorShortName"
  | "iMA"
  | "iMACD"
  | "iATR"
  | "iRSI"
  | "iCustom"
  | "MarketInfo"
  | "SymbolsTotal"
  | "SymbolName"
  | "SymbolSelect"
  | "OrdersTotal"
  | "OrdersHistoryTotal"
  | "OrderSelect"
  | "OrderType"
  | "OrderTicket"
  | "OrderSymbol"
  | "OrderLots"
  | "OrderOpenPrice"
  | "OrderOpenTime"
  | "OrderClosePrice"
  | "OrderCloseTime"
  | "OrderStopLoss"
  | "OrderTakeProfit"
  | "OrderProfit"
  | "OrderCommission"
  | "OrderSwap"
  | "OrderComment"
  | "OrderMagicNumber"
  | "OrderExpiration"
  | "OrderClose"
  | "OrderModify"
  | "OrderDelete"
  | "OrderSend";

export interface MqlLibraryFunctions {
  AccountBalance(): number;
  AccountCompany(): string;
  AccountCredit(): number;
  AccountCurrency(): string;
  AccountEquity(): number;
  AccountFreeMargin(): number;
  AccountFreeMarginCheck(): number;
  AccountFreeMarginMode(): number;
  AccountInfoDouble(): number;
  AccountInfoInteger(): number;
  AccountInfoString(): string;
  AccountLeverage(): number;
  AccountMargin(): number;
  AccountName(): string;
  AccountNumber(): number;
  AccountProfit(): number;
  AccountServer(): string;
  AccountStopoutLevel(): number;
  AccountStopoutMode(): number;
  Bars(symbol: string, timeframe: number): number;
  iBars(symbol: string, timeframe: number): number;
  iBarShift(symbol: string, timeframe: number, time: number, exact?: boolean): number;
  iOpen(symbol: string, timeframe: number, shift: number): number;
  iHigh(symbol: string, timeframe: number, shift: number): number;
  iLow(symbol: string, timeframe: number, shift: number): number;
  iClose(symbol: string, timeframe: number, shift: number): number;
  iTime(symbol: string, timeframe: number, shift: number): number;
  iVolume(symbol: string, timeframe: number, shift: number): number;
  CopyRates(symbol: string, timeframe: number, start: number, count: number, dst: any[]): number;
  CopyTime(symbol: string, timeframe: number, start: number, count: number, dst: number[]): number;
  CopyOpen(symbol: string, timeframe: number, start: number, count: number, dst: number[]): number;
  CopyHigh(symbol: string, timeframe: number, start: number, count: number, dst: number[]): number;
  CopyLow(symbol: string, timeframe: number, start: number, count: number, dst: number[]): number;
  CopyClose(symbol: string, timeframe: number, start: number, count: number, dst: number[]): number;
  CopyTickVolume(
    symbol: string,
    timeframe: number,
    start: number,
    count: number,
    dst: number[]
  ): number;
  SeriesInfoInteger(symbol: string, timeframe: number, prop: number): number;
  RefreshRates(): number;
  ResetLastError(): number;
  IndicatorBuffers(count: number): number;
  SetIndexBuffer(index: number, arr: number[]): boolean;
  SetIndexLabel(index: number, text: string): boolean;
  SetIndexShift(index: number, shift: number): boolean;
  IndicatorCounted(): number;
  IndicatorDigits(): number;
  IndicatorSetDouble(prop: number, val: number): number;
  IndicatorSetInteger(prop: number, val: number): number;
  IndicatorSetString(prop: number, val: string): number;
  IndicatorShortName(name: string): number;
  iMA(
    symbol: string,
    timeframe: number,
    period: number,
    maShift: number,
    maMethod: number,
    appliedPrice: number,
    shift: number
  ): number;
  iMACD(
    symbol: string,
    timeframe: number,
    fast: number,
    slow: number,
    signal: number,
    appliedPrice: number,
    mode: number,
    shift: number
  ): number;
  iATR(symbol: string, timeframe: number, period: number, shift: number): number;
  iRSI(
    symbol: string,
    timeframe: number,
    period: number,
    appliedPrice: number,
    shift: number
  ): number;
  iCustom(symbol: string, timeframe: number, name: string, ...args: any[]): number;
  MarketInfo(symbol: string, type: number): number;
  SymbolsTotal(selected?: boolean): number;
  SymbolName(index: number, selected?: boolean): string;
  SymbolSelect(symbol: string, enable: boolean): boolean;
  OrdersTotal(): number;
  OrdersHistoryTotal(): number;
  OrderSelect(index: number, select: number, pool?: number): number;
  OrderType(): number;
  OrderTicket(): number;
  OrderSymbol(): string;
  OrderLots(): number;
  OrderOpenPrice(): number;
  OrderOpenTime(): number;
  OrderClosePrice(): number;
  OrderCloseTime(): number;
  OrderStopLoss(): number;
  OrderTakeProfit(): number;
  OrderProfit(): number;
  OrderCommission(): number;
  OrderSwap(): number;
  OrderComment(): string;
  OrderMagicNumber(): number;
  OrderExpiration(): number;
  OrderClose(
    ticket: number,
    lots: number,
    price: number,
    slippage?: number,
    arrowColor?: number
  ): number;
  OrderModify(
    ticket: number,
    price: number,
    sl: number,
    tp: number,
    expiration?: number,
    arrowColor?: number
  ): number;
  OrderDelete(ticket: number): number;
  OrderSend(
    symbol: string,
    cmd: number,
    volume: number,
    price: number,
    slippage: number,
    sl: number,
    tp: number,
    comment?: string,
    magic?: number,
    expiration?: number,
    arrowColor?: number
  ): number;
}

export type MqlLibrary = Partial<MqlLibraryFunctions>;
