import type { ITerminal } from "../domain/terminal";
import type { IBroker } from "../domain/broker";
import type { IAccount } from "../domain/account";
import type { IMarketData } from "../domain/marketData";
import type { IndicatorCache } from "../indicatorCache";

export interface ExecutionContext {
  symbol?: string;
  timeframe?: number;
  lastError?: number;
  terminal: ITerminal | null;
  broker: IBroker | null;
  account: IAccount | null;
  market: IMarketData | null;
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
