import type { ExecutionContext } from "../libs/domain/types";
import type { InMemoryMarketData as MarketData } from "../libs/domain/marketData";
import type { InMemoryTerminal as VirtualTerminal } from "../libs/domain/terminal";
import { candlesFor } from "./utils";
import { BacktestRunner } from "../backtestRunner";

export function iCustom(
  context: ExecutionContext,
  symbol: string,
  timeframe: number,
  name: string,
  ...args: any[]
): number {
  const sym = symbol && String(symbol).length ? String(symbol) : (context.symbol ?? "");
  const tf = timeframe || context.timeframe || 0;
  if (!context.market) return 0;
  const arr = candlesFor(context, sym, tf);
  const curIdx = arr.length - 1;
  const mode = Number(args[args.length - 2] ?? 0);
  const shift = Number(args[args.length - 1] ?? 0);
  const params = args.slice(0, -2);

  const engine = context.indicatorEngine;
  const source = engine?.getSource(name);
  if (!source || !engine) return 0;

  const key = { type: `iCustom:${name}`, symbol: sym, timeframe: tf, params } as const;
  const ctx = engine.getOrCreate(key, () => ({
    last: -1,
    buffers: [] as number[][],
    runner: new BacktestRunner(source, arr, {
      symbol: sym && String(sym).length ? sym : undefined,
      timeframe: tf,
      indicatorEngine: engine,
      market: context.market as MarketData,
      indicatorCache: engine.getCache(),
      terminal: context.terminal as VirtualTerminal,
    }),
  }));

  if (ctx.last < curIdx) {
    for (let i = ctx.last + 1; i <= curIdx; i++) ctx.runner.step();
    ctx.buffers = ctx.runner.getRuntime().globalValues._IndicatorBuffers ?? [];
    ctx.last = curIdx;
  }
  const idx = curIdx - shift;
  return idx < 0 ? 0 : (ctx.buffers[mode]?.[idx] ?? 0);
}
