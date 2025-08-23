import type { BuiltinFunction, ExecutionContext } from "./types";

export function createAccountFunctions(context: ExecutionContext): Record<string, BuiltinFunction> {
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

// Legacy exports for registry.ts compatibility - these should not be used directly
const createDummyContext = () => ({ 
  terminal: null, 
  broker: null, 
  account: null, 
  market: null, 
  symbol: "", 
  timeframe: 0, 
  indicators: null 
});
const accountFuncs = createAccountFunctions(createDummyContext() as any);

export const AccountBalance = accountFuncs.AccountBalance;
export const AccountCompany = accountFuncs.AccountCompany;
export const AccountCredit = accountFuncs.AccountCredit;
export const AccountCurrency = accountFuncs.AccountCurrency;
export const AccountEquity = accountFuncs.AccountEquity;
export const AccountFreeMargin = accountFuncs.AccountFreeMargin;
export const AccountFreeMarginCheck = accountFuncs.AccountFreeMarginCheck;
export const AccountFreeMarginMode = accountFuncs.AccountFreeMarginMode;
export const AccountInfoDouble = accountFuncs.AccountInfoDouble;
export const AccountInfoInteger = accountFuncs.AccountInfoInteger;
export const AccountInfoString = accountFuncs.AccountInfoString;
export const AccountLeverage = accountFuncs.AccountLeverage;
export const AccountMargin = accountFuncs.AccountMargin;
export const AccountName = accountFuncs.AccountName;
export const AccountNumber = accountFuncs.AccountNumber;
export const AccountProfit = accountFuncs.AccountProfit;
export const AccountServer = accountFuncs.AccountServer;
export const AccountStopoutLevel = accountFuncs.AccountStopoutLevel;
export const AccountStopoutMode = accountFuncs.AccountStopoutMode;
