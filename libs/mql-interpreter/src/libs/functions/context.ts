import type { VirtualTerminal } from "../virtualTerminal";
import { Broker } from "../broker";
import { Account } from "../account";
import { MarketData } from "../marketData";
import { IndicatorCache } from "../indicatorCache";

export interface ExecutionContext {
  terminal: VirtualTerminal | null;
  broker: Broker | null;
  account: Account | null;
  market: MarketData | null;
  symbol?: string;
  timeframe?: number;
  indicators?: IndicatorCache;
}
