import type { VirtualTerminal } from "../virtualTerminal";
import { Broker } from "../broker";
import { Account } from "../account";
import { MarketData } from "../marketData";

export interface ExecutionContext {
  terminal: VirtualTerminal | null;
  broker: Broker | null;
  account: Account | null;
  market: MarketData | null;
  symbol?: string;
  timeframe?: number;
}

let ctx: ExecutionContext = {
  terminal: null,
  broker: null,
  account: null,
  market: null,
};

export function setContext(context: ExecutionContext): void {
  ctx = context;
}

export function getContext(): ExecutionContext {
  return ctx;
}
