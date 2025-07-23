export interface Order {
  type: 'buy' | 'sell';
  symbol: string;
  volume: number;
  price: number;
  sl?: number;
  tp?: number;
  openTime: number;
  closeTime?: number;
  closePrice?: number;
  profit?: number;
}

export class Broker {
  private orders: Order[] = [];
  sendOrder(order: Omit<Order, 'openTime'> & { time: number }): number {
    const { time, ...rest } = order;
    const newOrder: Order = { ...rest, openTime: time };
    this.orders.push(newOrder);
    return this.orders.length - 1; // ticket number
  }
  close(index: number, price: number, time: number): void {
    const o = this.orders[index];
    if (!o || o.closeTime) return;
    o.closePrice = price;
    o.closeTime = time;
    o.profit = (o.type === 'buy' ? price - o.price : o.price - price) * o.volume;
  }
  getOpenOrders(): Order[] {
    return this.orders.filter((o) => o.closeTime === undefined);
  }
  getHistory(): Order[] {
    return this.orders.filter((o) => o.closeTime !== undefined);
  }
}
