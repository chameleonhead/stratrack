import type { BuiltinFunction, ExecutionContext } from "./types";

export function createAccount(context: ExecutionContext): Record<string, BuiltinFunction> {
  return {
    AccountBalance: () => context.account?.getBalance() ?? 0,
    AccountCompany: () => "",
    AccountCredit: () => 0,
    AccountCurrency: () => context.account?.getCurrency() ?? "",
    AccountEquity: () => {
      if (!context.account || !context.broker) return 0;
      const metrics = context.account.getMetrics(context.broker, 0, 0);
      return metrics.equity;
    },
    AccountFreeMargin: () => {
      if (!context.account || !context.broker) return 0;
      const metrics = context.account.getMetrics(context.broker, 0, 0);
      return metrics.freeMargin;
    },
    AccountFreeMarginCheck: () => 0,
    AccountFreeMarginMode: () => 0,
    AccountInfoDouble: () => 0,
    AccountInfoInteger: () => 0,
    AccountInfoString: () => "",
    AccountLeverage: () => 0,
    AccountMargin: () => context.account?.getMargin() ?? 0,
    AccountName: () => "",
    AccountNumber: () => 0,
    AccountProfit: () => {
      if (!context.account || !context.broker) return 0;
      const metrics = context.account.getMetrics(context.broker, 0, 0);
      return metrics.openProfit + metrics.closedProfit;
    },
    AccountServer: () => "",
    AccountStopoutLevel: () => 0,
    AccountStopoutMode: () => 0,
  };
}


