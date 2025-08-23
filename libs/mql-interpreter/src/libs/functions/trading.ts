import type { ExecutionContext } from "../domain/types";
import type { Order } from "../domain/broker";
import type { BuiltinFunction } from "./types";

export function createTrading(context: ExecutionContext): Record<string, BuiltinFunction> {
  const broker = context.broker!;
  const account = context.account!;
  let selectedOrder: Order | undefined;
  return {
    OrdersTotal: () => broker.getActiveOrders().length,
    OrdersHistoryTotal: () => broker.getHistory().length,
    OrderSelect: (index: number, select: number, pool = 0) => {
      const byTicket = select === 1;
      const arr = pool === 1 ? broker.getHistory() : broker.getActiveOrders();
      selectedOrder = byTicket ? broker.getOrder(index) : arr[index];
      return selectedOrder ? 1 : 0;
    },
    OrderType: () => (selectedOrder ? (selectedOrder.type === "buy" ? 0 : 1) : -1),
    OrderTicket: () => selectedOrder?.ticket ?? -1,
    OrderSymbol: () => selectedOrder?.symbol ?? "",
    OrderLots: () => selectedOrder?.volume ?? 0,
    OrderOpenPrice: () => selectedOrder?.price ?? 0,
    OrderOpenTime: () => selectedOrder?.openTime ?? 0,
    OrderClosePrice: () => selectedOrder?.closePrice ?? 0,
    OrderCloseTime: () => selectedOrder?.closeTime ?? 0,
    OrderStopLoss: () => selectedOrder?.sl ?? 0,
    OrderTakeProfit: () => selectedOrder?.tp ?? 0,
    OrderProfit: () => selectedOrder?.profit ?? 0,
    OrderCommission: () => 0,
    OrderSwap: () => 0,
    OrderComment: () => "",
    OrderMagicNumber: () => 0,
    OrderExpiration: () => 0,
    OrderClose: (
      ticket: number,
      _lots: number,
      price: number,
      _slippage?: number,
      _arrowColor?: number
    ) => {
      const t = ticket >= 0 ? ticket : (selectedOrder?.ticket ?? -1);
      if (t < 0) return 0;
      const pr = broker.close(t, price, Date.now());
      if (pr) account.applyProfit(pr);
      return pr ? 1 : 0;
    },
    OrderModify: (
      ticket: number,
      price: number,
      sl: number,
      tp: number,
      _expiration?: number,
      _arrowColor?: number
    ) => {
      const t = ticket >= 0 ? ticket : (selectedOrder?.ticket ?? -1);
      if (t < 0) return 0;
      return broker.modify(t, price, sl, tp) ? 1 : 0;
    },
    OrderDelete: (ticket: number) => {
      const t = ticket >= 0 ? ticket : (selectedOrder?.ticket ?? -1);
      if (t < 0) return 0;
      const order = broker.getOrder(t);
      if (!order) return 0;
      order.state = "closed";
      return 1;
    },
    OrderSend: (
      symbol: string,
      cmd: number,
      volume: number,
      price: number,
      _slippage: number,
      sl: number,
      tp: number
    ) =>
      broker.sendOrder({
        symbol,
        cmd,
        volume,
        price,
        sl,
        tp,
        time: Date.now(),
        bid: price,
        ask: price,
      }),
  };
}
