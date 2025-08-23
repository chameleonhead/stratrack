import type { IAccount } from "../domain/account";
import type { IBroker } from "../domain/broker";
import { IndicatorCache } from "../indicatorCache";
import type { IMarketData } from "../domain/marketData";
import { VirtualTerminal } from "../virtualTerminal";

export type BuiltinFunction = (...args: any[]) => any;

export interface ExecutionContext {
    terminal: VirtualTerminal | null;
    broker: IBroker | null;
    account: IAccount | null;
    market: IMarketData | null;
    symbol?: string;
    timeframe?: number;
    indicators?: IndicatorCache;
}
