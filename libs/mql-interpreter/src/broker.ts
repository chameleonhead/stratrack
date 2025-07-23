export type OrderState = 'pending' | 'open' | 'closed';

export interface Order {
  type: 'buy' | 'sell';
  symbol: string;
  volume: number;
  /**
   * Price requested when placing the order. For market orders this becomes the
   * actual open price. Pending orders retain the requested price until they are
   * triggered.
   */
  price: number;
  sl?: number;
  tp?: number;
  /** Timestamp when the order was opened. Undefined for pending orders */
  openTime?: number;
  /** Current state of the order */
  state: OrderState;
  closeTime?: number;
  closePrice?: number;
  profit?: number;
}

export class Broker {
  private orders: Order[] = [];
  private balance = 0;

  /**
   * Create a new order. `cmd` follows the MT4 enumeration where
   * 0: buy, 1: sell, 2: buy limit, 3: sell limit.
   */
  sendOrder(args: {
    symbol: string;
    cmd: number;
    volume: number;
    price: number;
    sl: number;
    tp: number;
    time: number;
    bid: number;
    ask: number;
  }): number {
    const { symbol, cmd, volume, price, sl, tp, time, bid, ask } = args;
    const type = cmd === 1 || cmd === 3 ? 'sell' : 'buy';
    const pending = cmd === 2 || cmd === 3;
    const order: Order = {
      symbol,
      type,
      volume,
      price,
      sl: sl > 0 ? sl : undefined,
      tp: tp > 0 ? tp : undefined,
      state: pending ? 'pending' : 'open',
      openTime: pending ? undefined : time,
    };
    // For market orders use the current bid/ask as execution price
    if (!pending) {
      order.price = type === 'buy' ? ask : bid;
    }
    this.orders.push(order);
    return this.orders.length - 1; // ticket number
  }

  /**
   * Update all orders against the latest candle. Pending orders may be opened
   * and open orders checked for TP/SL conditions.
   */
  update(candle: { time: number; high: number; low: number; close: number }): void {
    for (const order of this.orders) {
      if (order.state === 'closed') continue;

      if (order.state === 'pending') {
        const withinRange =
          candle.low <= order.price && candle.high >= order.price;
        if (withinRange) {
          order.state = 'open';
          order.openTime = candle.time;
        } else {
          continue;
        }
      }

      if (order.state === 'open') {
        const tpHit =
          order.tp !== undefined &&
          ((order.type === 'buy' && candle.high >= order.tp) ||
            (order.type === 'sell' && candle.low <= order.tp));
        const slHit =
          order.sl !== undefined &&
          ((order.type === 'buy' && candle.low <= order.sl) ||
            (order.type === 'sell' && candle.high >= order.sl));

        if (tpHit || slHit) {
          const price = tpHit ? order.tp! : order.sl!;
          order.closePrice = price;
          order.closeTime = candle.time;
          order.state = 'closed';
          order.profit =
            (order.type === 'buy' ? price - order.price : order.price - price) *
            order.volume;
          this.balance += order.profit;
        }
      }
    }
  }

  close(index: number, price: number, time: number): void {
    const o = this.orders[index];
    if (!o || o.state === 'closed') return;
    o.closePrice = price;
    o.closeTime = time;
    o.state = 'closed';
    o.profit = (o.type === 'buy' ? price - o.price : o.price - price) * o.volume;
    this.balance += o.profit;
  }

  getOpenOrders(): Order[] {
    return this.orders.filter((o) => o.state === 'open');
  }

  /** Pending and open orders */
  getActiveOrders(): Order[] {
    return this.orders.filter((o) => o.state !== 'closed');
  }

  getHistory(): Order[] {
    return this.orders.filter((o) => o.state === 'closed');
  }

  getBalance(): number {
    return this.balance;
  }

  /**
   * Calculate account metrics using the current bid/ask price for open orders.
   */
  getAccountMetrics(bid: number, ask: number): {
    balance: number;
    equity: number;
    closedProfit: number;
    openProfit: number;
  } {
    let openProfit = 0;
    for (const o of this.orders) {
      if (o.state !== 'open') continue;
      const price = o.type === 'buy' ? bid : ask;
      openProfit += (o.type === 'buy' ? price - o.price : o.price - price) * o.volume;
    }
    const closedProfit = this.orders
      .filter((o) => o.state === 'closed')
      .reduce((sum, o) => sum + (o.profit || 0), 0);
    return {
      balance: this.balance,
      equity: this.balance + openProfit,
      closedProfit,
      openProfit,
    };
  }
}
