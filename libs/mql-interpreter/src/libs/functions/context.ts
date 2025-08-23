import type { ITerminal } from "../domain/terminal";
import type { IBroker } from "../domain/broker";
import type { IAccount } from "../domain/account";
import type { IMarketData } from "../domain/marketData";
import type { IndicatorCache } from "../indicatorCache";

export interface ExecutionContext {
  terminal: ITerminal | null;
  broker: IBroker | null;
  account: IAccount | null;
  market: IMarketData | null;
  symbol?: string;
  timeframe?: number;
  indicators?: IndicatorCache;
}
