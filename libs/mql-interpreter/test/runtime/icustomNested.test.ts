import { describe, it, expect, beforeEach } from "vitest";
import { runProgram } from "../helpers";
import { registerEnvBuiltins } from "../../src/libs/functions";
import { createLibs } from "../../src/libs/factory";
import type { ExecutionContext } from "../../src/libs/functions/types";
import { InMemoryMarketData } from "../../src/libs/domain/marketData";
import type { Candle } from "../../src/libs/domain/marketData";
import { InMemoryIndicatorEngine, InMemoryIndicatorSource } from "../../src/libs/domain/indicator";
import { callFunction } from "../../src/runtime/runtime";

describe("iCustom nested indicators", () => {
  let context: ExecutionContext;

  beforeEach(() => {
    const testCandles: Candle[] = [
      { time: 1000, open: 1.0, high: 1.1, low: 0.9, close: 1.05, volume: 1000 },
      { time: 2000, open: 1.05, high: 1.15, low: 1.0, close: 1.1, volume: 1100 },
      { time: 3000, open: 1.1, high: 1.2, low: 1.05, close: 1.15, volume: 1200 },
      { time: 4000, open: 1.15, high: 1.25, low: 1.1, close: 1.2, volume: 1300 },
      { time: 5000, open: 1.2, high: 1.3, low: 1.15, close: 1.25, volume: 1400 },
    ];

    const marketData = new InMemoryMarketData({}, { GBPUSD: { 15: testCandles } });

    const source = new InMemoryIndicatorSource();
    source.set(
      "Inner",
      `
int OnInit(){IndicatorBuffers(1);SetIndexBuffer(0,Close);return 0;}
int OnCalculate(){return Bars;}
`
    );
    source.set(
      "Outer",
      `
double ExtMapBuffer[];
int OnInit(){IndicatorBuffers(1);SetIndexBuffer(0,ExtMapBuffer);return 0;}
int OnCalculate(){ExtMapBuffer[Bars-1]=iCustom(_Symbol,_Period,"Inner",0,0);return Bars;}
`
    );

    const engine = new InMemoryIndicatorEngine(source);

    context = {
      terminal: null,
      broker: null,
      account: null,
      market: marketData,
      symbol: "GBPUSD",
      timeframe: 15,
      indicatorEngine: engine,
    };

    const libs = createLibs(context);
    registerEnvBuiltins(libs);
  });

  it("executes nested custom indicators via iCustom", () => {
    const runtime = runProgram(
      `
double result;
int OnInit(){result=iCustom(_Symbol,_Period,"Outer",0,0);return 0;}
`,
      context
    );

    const key = {
      type: "iCustom:Inner",
      symbol: "GBPUSD",
      timeframe: 15,
      params: [],
    } as const;
    callFunction(runtime, "OnInit");
    expect(context.indicatorEngine!.peek(key)).toBeDefined();
    expect(runtime.globalValues.result).toBe(0);
  });
});
