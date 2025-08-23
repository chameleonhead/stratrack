import type { IAccount } from "../domain/account";
import type { IBroker } from "../domain/broker";
import { IndicatorCache } from "../indicatorCache";
import type { IMarketData } from "../domain/marketData";
import type { ITerminal } from "../domain/terminal";

export type BuiltinFunction = (...args: any[]) => any;

export interface ExecutionContext {
    terminal: ITerminal | null;
    broker: IBroker | null;
    account: IAccount | null;
    market: IMarketData | null;
    symbol?: string;
    timeframe?: number;
    indicators?: IndicatorCache;
}
