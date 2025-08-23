export type OrderState = "pending" | "open" | "closed";

export interface Order {
  /** Ticket number (index) */
  ticket: number;
  type: "buy" | "sell";
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

export interface IBroker {
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
  }): number;
  
  update(candle: { time: number; high: number; low: number; close: number }): number;
  close(ticket: number, price: number, time: number): number;
  modify(ticket: number, price: number, sl: number, tp: number): boolean;
  getOpenOrders(): Order[];
  getOrder(ticket: number): Order | undefined;
  getActiveOrders(): Order[];
  getAllOrders(): Order[];
  getHistory(): Order[];
  calculateOpenProfit(bid: number, ask: number): number;
  getClosedProfit(): number;
  onTrade(cb: (order: Order) => void): void;
}
