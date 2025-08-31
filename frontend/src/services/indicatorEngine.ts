import {
  InMemoryIndicatorEngine,
  InMemoryIndicatorSource,
} from "../../../libs/mql-interpreter/src/libs/domain/indicator";
import { ApiMarketData } from "./stratrackMarketData.ts";
import type { ExecutionContext } from "../../../libs/mql-interpreter/src/libs/domain/types.ts";
import { iMA } from "../../../libs/mql-interpreter/src/ta/ma.ts";

export interface IndicatorDefinition {
  name: string;
  args: number[];
  symbol?: string;
  timeframe?: number;
  pane?: number;
}

interface MaState {
  last: number;
  values: number[];
}

let engine: InMemoryIndicatorEngine;
let market: ApiMarketData;
let context: ExecutionContext;
let currentIndicators: IndicatorDefinition[] = [];
let baseSymbol = "";
let baseTimeframe = 0;
let indicatorSource = new InMemoryIndicatorSource();
const sourceSubscribers = new Set<() => void>();

export const indicatorEngine = {
  set(name: string, src: string): void {
    indicatorSource.set(name, src);
    engine?.set(name, src);
    for (const cb of sourceSubscribers) cb();
  },
};

export function setIndicatorSource(source: Record<string, string>): void {
  indicatorSource = new InMemoryIndicatorSource(source);
  if (engine) {
    engine = new InMemoryIndicatorEngine(indicatorSource);
  }
  for (const cb of sourceSubscribers) cb();
}

export function subscribeIndicatorSource(cb: () => void): () => void {
  sourceSubscribers.add(cb);
  return () => {
    sourceSubscribers.delete(cb);
  };
}

function getMaKey(symbol: string, timeframe: number, args: number[]) {
  const [period, , maMethod, applied] = args;
  return {
    type: "iMA" as const,
    symbol,
    timeframe,
    params: { period, maMethod, applied },
  };
}

export async function calculateIndicators(
  symbol: string,
  timeframe: number,
  indicators: IndicatorDefinition[]
): Promise<number[][]> {
  engine = new InMemoryIndicatorEngine(indicatorSource);
  market = new ApiMarketData();
  baseSymbol = symbol;
  baseTimeframe = timeframe;
  await market.load(symbol, timeframe);
  for (const ind of indicators) {
    const s = ind.symbol ?? symbol;
    const tf = ind.timeframe ?? timeframe;
    await market.load(s, tf);
  }
  context = {
    terminal: null,
    broker: null,
    account: null,
    market,
    symbol,
    timeframe,
    indicatorEngine: engine,
  };
  currentIndicators = indicators;

  const results: number[][] = [];
  for (const ind of indicators) {
    switch (ind.name) {
      case "iMA": {
        const s = ind.symbol ?? symbol;
        const tf = ind.timeframe ?? timeframe;
        iMA(context, s, tf, ...(ind.args as [number, number, number, number, number]));
        const key = getMaKey(s, tf, ind.args);
        const state = engine.peek<MaState>(key);
        results.push(state ? [...state.values] : []);
        break;
      }
      default:
        results.push([]);
    }
  }
  return results;
}

export async function updateIndicators(): Promise<number[][]> {
  if (!context) throw new Error("calculateIndicators must be called first");

  const unique = new Set<string>();
  const pairs = [
    { symbol: baseSymbol, timeframe: baseTimeframe },
    ...currentIndicators.map((i) => ({
      symbol: i.symbol ?? baseSymbol,
      timeframe: i.timeframe ?? baseTimeframe,
    })),
  ];
  for (const p of pairs) {
    const key = `${p.symbol}-${p.timeframe}`;
    if (unique.has(key)) continue;
    unique.add(key);
    await market.update(p.symbol, p.timeframe);
  }

  const results: number[][] = [];

  for (const ind of currentIndicators) {
    switch (ind.name) {
      case "iMA": {
        const s = ind.symbol ?? baseSymbol;
        const tf = ind.timeframe ?? baseTimeframe;
        const key = getMaKey(s, tf, ind.args);
        const prev = engine.peek<MaState>(key);
        const prevLast = prev?.last ?? -1;
        iMA(context, s, tf, ...(ind.args as [number, number, number, number, number]));
        const state = engine.peek<MaState>(key);
        const start = prevLast + 1;
        const end = state ? state.last + 1 : start;
        results.push(state ? state.values.slice(start, end) : []);
        break;
      }
      default:
        results.push([]);
    }
  }
  return results;
}
