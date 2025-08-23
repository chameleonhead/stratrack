import type { VirtualTerminal } from "../virtualTerminal";
import { InMemoryBroker as Broker } from "../domain/broker";
import { InMemoryAccount as Account } from "../domain/account";
import { InMemoryMarketData as MarketData } from "../domain/marketData";
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
