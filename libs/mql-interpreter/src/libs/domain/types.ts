import type { ITerminal } from "../domain/terminal";
import type { IBroker, Order } from "../domain/broker";
import type { IAccount } from "../domain/account";
import type { IMarketData } from "../domain/marketData";
import type { IndicatorCache } from "../indicatorCache";
import type { IndicatorSource } from "../indicatorSource";

export interface ExecutionContext {
  symbol?: string;
  timeframe?: number;
  digits?: number;
  lastError?: number;
  terminal: ITerminal | null;
  broker: IBroker | null;
  account: IAccount | null;
  market: IMarketData | null;
  getBid?: () => number;
  getAsk?: () => number;
  getTime?: () => number;
  getStopFlag?: () => number;
  selectedOrder?: Order;
  indicatorSource?: IndicatorSource | null;
  indicators?: IndicatorCache;
  // Custom indicator state
  hideTestIndicators?: boolean;
  indicatorBuffers?: number[][];
  indicatorCounted?: number;
  indicatorDigits?: number;
  indicatorShortName?: string;
  indexArrows?: Record<number, number>;
  indexDrawBegins?: Record<number, number>;
  indexEmptyValues?: Record<number, number>;
  indexLabels?: Record<number, string>;
  indexShifts?: Record<number, number>;
  indexStyles?: Record<number, { style: number; width: number; color: number }>;
  levelStyles?: Record<number, { style: number; width: number; color: number }>;
  levelValues?: Record<number, number>;
}
