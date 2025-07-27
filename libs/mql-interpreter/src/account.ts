export interface AccountMetrics {
  balance: number;
  equity: number;
  closedProfit: number;
  openProfit: number;
}

export class Account {
  private balance: number;

  constructor(initialBalance = 0) {
    this.balance = initialBalance;
  }

  applyProfit(profit: number): void {
    this.balance += profit;
  }

  getBalance(): number {
    return this.balance;
  }

  getMetrics(
    broker: { calculateOpenProfit(bid: number, ask: number): number; getClosedProfit(): number },
    bid: number,
    ask: number
  ): AccountMetrics {
    const openProfit = broker.calculateOpenProfit(bid, ask);
    const closedProfit = broker.getClosedProfit();
    return {
      balance: this.balance,
      equity: this.balance + openProfit,
      closedProfit,
      openProfit,
    };
  }
}
