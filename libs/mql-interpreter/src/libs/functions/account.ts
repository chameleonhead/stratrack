import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";

export function createAccount(context: ExecutionContext): Record<string, BuiltinFunction> {
  const metrics = () => {
    if (!context.account || !context.broker) return null;
    const bid = context.getBid ? context.getBid() : 0;
    const ask = context.getAsk ? context.getAsk() : 0;
    return context.account.getMetrics(context.broker, bid, ask);
  };
  return {
    AccountBalance: () => context.account?.getBalance() ?? 0,
    AccountCompany: () => "Backtest",
    AccountCredit: () => 0,
    AccountCurrency: () => context.account?.getCurrency() ?? "",
    AccountEquity: () => metrics()?.equity ?? 0,
    AccountFreeMargin: () => metrics()?.freeMargin ?? 0,
    AccountFreeMarginCheck: () => metrics()?.equity ?? 0,
    AccountFreeMarginMode: () => 0,
    AccountInfoDouble: () => 0,
    AccountInfoInteger: () => 0,
    AccountInfoString: () => "",
    AccountLeverage: () => 1,
    AccountMargin: () => metrics()?.margin ?? 0,
    AccountName: () => "Backtest",
    AccountNumber: () => 1,
    AccountProfit: () => {
      const m = metrics();
      return m ? m.openProfit + m.closedProfit : 0;
    },
    AccountServer: () => "Backtest",
    AccountStopoutLevel: () => 0,
    AccountStopoutMode: () => 0,
  };
}
