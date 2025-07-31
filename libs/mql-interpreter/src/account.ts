export interface AccountMetrics {
  balance: number;
  equity: number;
  closedProfit: number;
  openProfit: number;
  margin: number;
  freeMargin: number;
}

export class Account {
  private balance: number;
  private margin: number;
  private currency: string;

  constructor(initialBalance = 10000, initialMargin = 0, currency = "USD") {
    this.balance = initialBalance;
    this.margin = initialMargin;
    this.currency = currency;
  }

  applyProfit(profit: number): void {
    this.balance += profit;
  }

  getBalance(): number {
    return this.balance;
  }

  getCurrency(): string {
    return this.currency;
  }

  getMargin(): number {
    return this.margin;
  }

  getMetrics(
    broker: { calculateOpenProfit(bid: number, ask: number): number; getClosedProfit(): number },
    bid: number,
    ask: number
  ): AccountMetrics {
    const openProfit = broker.calculateOpenProfit(bid, ask);
    const closedProfit = broker.getClosedProfit();
    const equity = this.balance + openProfit;
    return {
      balance: this.balance,
      equity,
      closedProfit,
      openProfit,
      margin: this.margin,
      freeMargin: equity - this.margin,
    };
  }
}
