import { Account } from "../account";
import { Broker } from "../broker";
import { IndicatorCache } from "../indicatorCache";
import { MarketData } from "../marketData";
import { VirtualTerminal } from "../virtualTerminal";

export type BuiltinFunction = (...args: any[]) => any;

export interface ExecutionContext {
    terminal: VirtualTerminal | null;
    broker: Broker | null;
    account: Account | null;
    market: MarketData | null;
    symbol?: string;
    timeframe?: number;
    indicators?: IndicatorCache;
}
