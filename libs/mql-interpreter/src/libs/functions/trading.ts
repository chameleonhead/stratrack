import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";

export function createTrading(context: ExecutionContext): Record<string, BuiltinFunction> {
  const broker = context.broker!;
  const account = context.account!;
  const getBid = context.getBid ?? (() => 0);
  const getAsk = context.getAsk ?? (() => 0);
  const getTime = context.getTime ?? (() => Date.now() / 1000);
  return {
    OrdersTotal: () => broker.getActiveOrders().length,
    OrdersHistoryTotal: () => broker.getHistory().length,
    HistoryTotal: () => broker.getHistory().length,
    OrderSelect: (index: number, select: number, pool = 0) => {
      const byTicket = select === 1;
      const arr = pool === 1 ? broker.getHistory() : broker.getActiveOrders();
      context.selectedOrder = byTicket ? broker.getOrder(index) : arr[index];
      return context.selectedOrder ? 1 : 0;
    },
    OrderType: () => (context.selectedOrder ? (context.selectedOrder.type === "buy" ? 0 : 1) : -1),
    OrderTicket: () => context.selectedOrder?.ticket ?? -1,
    OrderSymbol: () => context.selectedOrder?.symbol ?? "",
    OrderLots: () => context.selectedOrder?.volume ?? 0,
    OrderOpenPrice: () => context.selectedOrder?.price ?? 0,
    OrderOpenTime: () => context.selectedOrder?.openTime ?? 0,
    OrderClosePrice: () => context.selectedOrder?.closePrice ?? 0,
    OrderCloseTime: () => context.selectedOrder?.closeTime ?? 0,
    OrderStopLoss: () => context.selectedOrder?.sl ?? 0,
    OrderTakeProfit: () => context.selectedOrder?.tp ?? 0,
    OrderProfit: () => context.selectedOrder?.profit ?? 0,
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
      const t = ticket >= 0 ? ticket : (context.selectedOrder?.ticket ?? -1);
      if (t < 0) return 0;
      const p = price > 0 ? price : getBid();
      const pr = broker.close(t, p, getTime());
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
      const t = ticket >= 0 ? ticket : (context.selectedOrder?.ticket ?? -1);
      if (t < 0) return 0;
      return broker.modify(t, price, sl, tp) ? 1 : 0;
    },
    OrderDelete: (ticket: number) => {
      const t = ticket >= 0 ? ticket : (context.selectedOrder?.ticket ?? -1);
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
        time: getTime(),
        bid: getBid(),
        ask: getAsk(),
      }),
  };
}
