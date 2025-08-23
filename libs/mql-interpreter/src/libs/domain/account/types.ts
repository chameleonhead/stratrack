export interface AccountMetrics {
  balance: number;
  equity: number;
  closedProfit: number;
  openProfit: number;
  margin: number;
  freeMargin: number;
}

export interface IAccount {
  applyProfit(profit: number): void;
  getBalance(): number;
  getCurrency(): string;
  getMargin(): number;
  getMetrics(
    broker: { calculateOpenProfit(bid: number, ask: number): number; getClosedProfit(): number },
    bid: number,
    ask: number
  ): AccountMetrics;
}
