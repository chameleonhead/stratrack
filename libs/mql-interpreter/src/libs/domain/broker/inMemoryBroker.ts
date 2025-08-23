import type { IBroker, Order } from "./types";

export class InMemoryBroker implements IBroker {
  private orders: Order[] = [];
  private tradeListeners: ((order: Order) => void)[] = [];

  constructor() {}

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
    const type = cmd === 1 || cmd === 3 ? "sell" : "buy";
    const pending = cmd === 2 || cmd === 3;
    const order: Order = {
      ticket: this.orders.length,
      symbol,
      type,
      volume,
      price,
      sl: sl > 0 ? sl : undefined,
      tp: tp > 0 ? tp : undefined,
      state: pending ? "pending" : "open",
      openTime: pending ? undefined : time,
    };
    // For market orders use the current bid/ask as execution price
    if (!pending) {
      order.price = type === "buy" ? ask : bid;
    }
    this.orders.push(order);
    this.triggerTrade(order);
    return this.orders.length - 1; // ticket number
  }

  /**
   * Update all orders against the latest candle. Pending orders may be opened
   * and open orders checked for TP/SL conditions.
   */
  update(candle: { time: number; high: number; low: number; close: number }): number {
    let closedProfit = 0;
    for (const order of this.orders) {
      if (order.state === "closed") continue;

      if (order.state === "pending") {
        const withinRange = candle.low <= order.price && candle.high >= order.price;
        if (withinRange) {
          order.state = "open";
          order.openTime = candle.time;
          this.triggerTrade(order);
        } else {
          continue;
        }
      }

      if (order.state === "open") {
        const tpHit =
          order.tp !== undefined &&
          ((order.type === "buy" && candle.high >= order.tp) ||
            (order.type === "sell" && candle.low <= order.tp));
        const slHit =
          order.sl !== undefined &&
          ((order.type === "buy" && candle.low <= order.sl) ||
            (order.type === "sell" && candle.high >= order.sl));

        if (tpHit || slHit) {
          const price = tpHit ? order.tp! : order.sl!;
          order.closePrice = price;
          order.closeTime = candle.time;
          order.state = "closed";
          order.profit =
            (order.type === "buy" ? price - order.price : order.price - price) * order.volume;
          closedProfit += order.profit;
          this.triggerTrade(order);
        }
      }
    }
    return closedProfit;
  }

  close(ticket: number, price: number, time: number): number {
    const o = this.orders[ticket];
    if (!o || o.state === "closed") return 0;
    o.closePrice = price;
    o.closeTime = time;
    o.state = "closed";
    o.profit = (o.type === "buy" ? price - o.price : o.price - price) * o.volume;
    this.triggerTrade(o);
    return o.profit;
  }

  modify(ticket: number, price: number, sl: number, tp: number): boolean {
    const o = this.orders[ticket];
    if (!o || o.state === "closed") return false;
    if (o.state === "pending" && price > 0) {
      o.price = price;
    }
    if (sl > 0) o.sl = sl;
    else if (sl <= 0) o.sl = undefined;
    if (tp > 0) o.tp = tp;
    else if (tp <= 0) o.tp = undefined;
    this.triggerTrade(o);
    return true;
  }

  getOpenOrders(): Order[] {
    return this.orders.filter((o) => o.state === "open");
  }

  getOrder(ticket: number): Order | undefined {
    return this.orders[ticket];
  }

  /** Pending and open orders */
  getActiveOrders(): Order[] {
    return this.orders.filter((o) => o.state !== "closed");
  }

  /** Direct access for tests or builtins */
  getAllOrders(): Order[] {
    return this.orders;
  }

  getHistory(): Order[] {
    return this.orders.filter((o) => o.state === "closed");
  }

  /**
   * Calculate profit for open orders using the current bid/ask price.
   */
  calculateOpenProfit(bid: number, ask: number): number {
    let openProfit = 0;
    for (const o of this.orders) {
      if (o.state !== "open") continue;
      const price = o.type === "buy" ? bid : ask;
      openProfit += (o.type === "buy" ? price - o.price : o.price - price) * o.volume;
    }
    return openProfit;
  }

  getClosedProfit(): number {
    return this.orders
      .filter((o) => o.state === "closed")
      .reduce((sum, o) => sum + (o.profit || 0), 0);
  }

  onTrade(cb: (order: Order) => void): void {
    this.tradeListeners.push(cb);
  }

  private triggerTrade(order: Order): void {
    for (const cb of this.tradeListeners) cb(order);
  }
}
