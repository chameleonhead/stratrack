import { describe, it, expect, beforeEach } from "vitest";
import { createSeries } from "../../../src/libs/functions/series";
import type { ExecutionContext } from "../../../src/libs/domain/types";
import { IndicatorCache } from "../../../src/libs/indicatorCache";
import { InMemoryMarketData } from "../../../src/libs/domain/marketData";
import type { Candle } from "../../../src/libs/domain/marketData";

describe("series functions", () => {
  let context: ExecutionContext;
  let marketData: InMemoryMarketData;

  beforeEach(() => {
    // テスト用のデータを準備（時間順に並べる）
    const testCandles: Candle[] = [
      { time: 1000, open: 1.0, high: 1.1, low: 0.9, close: 1.05, volume: 1000 },
      { time: 2000, open: 1.05, high: 1.15, low: 1.0, close: 1.1, volume: 1100 },
      { time: 3000, open: 1.1, high: 1.2, low: 1.05, close: 1.15, volume: 1200 },
      { time: 4000, open: 1.15, high: 1.25, low: 1.1, close: 1.2, volume: 1300 },
      { time: 5000, open: 1.2, high: 1.3, low: 1.15, close: 1.25, volume: 1400 },
    ];
    
    // コンストラクタでデータを渡す
    marketData = new InMemoryMarketData(
      {}, // 空のtickData
      { "GBPUSD": { 15: testCandles } } // candleData
    );

    context = {
      terminal: null,
      broker: null,
      account: null,
      market: marketData,
      symbol: "GBPUSD",
      timeframe: 15,
      indicators: new IndicatorCache(),
    };
  });

  describe("Bars and iBars", () => {
    it("should return correct number of bars", () => {
      const functions = createSeries(context);
      expect(functions.Bars("GBPUSD", 15)).toBe(5);
      expect(functions.iBars("GBPUSD", 15)).toBe(5);
    });

    it("should return 0 for invalid symbol", () => {
      const functions = createSeries(context);
      expect(functions.Bars("INVALID", 15)).toBe(0);
      expect(functions.iBars("INVALID", 15)).toBe(0);
    });
  });

  describe("iBarShift", () => {
    it("should find exact time match", () => {
      const functions = createSeries(context);
      const result = functions.iBarShift("GBPUSD", 15, 3000);
      expect(result).toBe(2);
    });

    it("should find approximate time match when exact is false", () => {
      const functions = createSeries(context);
      const result = functions.iBarShift("GBPUSD", 15, 2500, false);
      expect(result).toBe(1); // 2500は2000と3000の間なので、インデックス1
    });

    it("should return -1 for time not found", () => {
      const functions = createSeries(context);
      const result = functions.iBarShift("GBPUSD", 15, 9999);
      expect(result).toBe(-1);
    });
  });

  describe("Price functions", () => {
    it("should return correct open prices", () => {
      const functions = createSeries(context);
      expect(functions.iOpen("GBPUSD", 15, 0)).toBe(1.2); // 最新のバー
      expect(functions.iOpen("GBPUSD", 15, 1)).toBe(1.15); // 1つ前のバー
    });

    it("should return correct high prices", () => {
      const functions = createSeries(context);
      expect(functions.iHigh("GBPUSD", 15, 0)).toBe(1.3); // 最新のバー
      expect(functions.iHigh("GBPUSD", 15, 1)).toBe(1.25); // 1つ前のバー
    });

    it("should return correct low prices", () => {
      const functions = createSeries(context);
      expect(functions.iLow("GBPUSD", 15, 0)).toBe(1.15); // 最新のバー
      expect(functions.iLow("GBPUSD", 15, 1)).toBe(1.1); // 1つ前のバー
    });

    it("should return correct close prices", () => {
      const functions = createSeries(context);
      expect(functions.iClose("GBPUSD", 15, 0)).toBe(1.25); // 最新のバー
      expect(functions.iClose("GBPUSD", 15, 1)).toBe(1.2); // 1つ前のバー
    });

    it("should return 0 for invalid shift", () => {
      const functions = createSeries(context);
      expect(functions.iOpen("GBPUSD", 15, 999)).toBe(0);
      expect(functions.iHigh("GBPUSD", 15, 999)).toBe(0);
      expect(functions.iLow("GBPUSD", 15, 999)).toBe(0);
      expect(functions.iClose("GBPUSD", 15, 999)).toBe(0);
    });
  });

  describe("iTime", () => {
    it("should return correct time values", () => {
      const functions = createSeries(context);
      expect(functions.iTime("GBPUSD", 15, 0)).toBe(5000); // 最新のバー
      expect(functions.iTime("GBPUSD", 15, 1)).toBe(4000); // 1つ前のバー
    });

    it("should return 0 for invalid shift", () => {
      const functions = createSeries(context);
      expect(functions.iTime("GBPUSD", 15, 999)).toBe(0);
    });
  });

  describe("iVolume", () => {
    it("should return correct volume values", () => {
      const functions = createSeries(context);
      expect(functions.iVolume("GBPUSD", 15, 0)).toBe(1400); // 最新のバー
      expect(functions.iVolume("GBPUSD", 15, 1)).toBe(1300); // 1つ前のバー
    });

    it("should return 0 for invalid shift", () => {
      const functions = createSeries(context);
      expect(functions.iVolume("GBPUSD", 15, 999)).toBe(0);
    });
  });

  describe("iHighest", () => {
    it("should find highest high price", () => {
      const functions = createSeries(context);
      const result = functions.iHighest("GBPUSD", 15, 0, 3, 0); // PRICE_HIGH, 3 bars from start
      expect(result).toBe(2); // インデックス2のバーが最高値
    });

    it("should find highest close price", () => {
      const functions = createSeries(context);
      const result = functions.iHighest("GBPUSD", 15, 2, 3, 0); // PRICE_CLOSE, 3 bars from start
      expect(result).toBe(2); // インデックス2のバーが最高値
    });

    it("should return -1 for invalid range", () => {
      const functions = createSeries(context);
      const result = functions.iHighest("GBPUSD", 15, 0, 10, 0); // 10 bars requested but only 5 available
      expect(result).toBe(-1);
    });
  });

  describe("iLowest", () => {
    it("should find lowest low price", () => {
      const functions = createSeries(context);
      const result = functions.iLowest("GBPUSD", 15, 1, 3, 0); // PRICE_LOW, 3 bars from start
      expect(result).toBe(0); // インデックス0のバーが最安値
    });

    it("should find lowest close price", () => {
      const functions = createSeries(context);
      const result = functions.iLowest("GBPUSD", 15, 2, 3, 0); // PRICE_CLOSE, 3 bars from start
      expect(result).toBe(0); // インデックス0のバーが最安値
    });

    it("should return -1 for invalid range", () => {
      const functions = createSeries(context);
      const result = functions.iLowest("GBPUSD", 15, 0, 10, 0); // 10 bars requested but only 5 available
      expect(result).toBe(-1);
    });
  });

  describe("Copy functions", () => {
    it("should copy rates correctly", () => {
      const functions = createSeries(context);
      const dst: any[] = [];
      const result = functions.CopyRates("GBPUSD", 15, 0, 3, dst);
      
      expect(result).toBe(3);
      expect(dst[0]).toEqual({
        open: 1.0,
        high: 1.1,
        low: 0.9,
        close: 1.05,
        tick_volume: 1000,
        time: 1000,
      });
    });

    it("should copy time correctly", () => {
      const functions = createSeries(context);
      const dst: number[] = [];
      const result = functions.CopyTime("GBPUSD", 15, 0, 3, dst);
      
      expect(result).toBe(3);
      expect(dst[0]).toBe(1000);
      expect(dst[1]).toBe(2000);
      expect(dst[2]).toBe(3000);
    });

    it("should copy open prices correctly", () => {
      const functions = createSeries(context);
      const dst: number[] = [];
      const result = functions.CopyOpen("GBPUSD", 15, 0, 3, dst);
      
      expect(result).toBe(3);
      expect(dst[0]).toBe(1.0);
      expect(dst[1]).toBe(1.05);
      expect(dst[2]).toBe(1.1);
    });

    it("should copy high prices correctly", () => {
      const functions = createSeries(context);
      const dst: number[] = [];
      const result = functions.CopyHigh("GBPUSD", 15, 0, 3, dst);
      
      expect(result).toBe(3);
      expect(dst[0]).toBe(1.1);
      expect(dst[1]).toBe(1.15);
      expect(dst[2]).toBe(1.2);
    });

    it("should copy low prices correctly", () => {
      const functions = createSeries(context);
      const dst: number[] = [];
      const result = functions.CopyLow("GBPUSD", 15, 0, 3, dst);
      
      expect(result).toBe(3);
      expect(dst[0]).toBe(0.9);
      expect(dst[1]).toBe(1.0);
      expect(dst[2]).toBe(1.05);
    });

    it("should copy close prices correctly", () => {
      const functions = createSeries(context);
      const dst: number[] = [];
      const result = functions.CopyClose("GBPUSD", 15, 0, 3, dst);
      
      expect(result).toBe(3);
      expect(dst[0]).toBe(1.05);
      expect(dst[1]).toBe(1.1);
      expect(dst[2]).toBe(1.15);
    });

    it("should copy tick volume correctly", () => {
      const functions = createSeries(context);
      const dst: number[] = [];
      const result = functions.CopyTickVolume("GBPUSD", 15, 0, 3, dst);
      
      expect(result).toBe(3);
      expect(dst[0]).toBe(1000);
      expect(dst[1]).toBe(1100);
      expect(dst[2]).toBe(1200);
    });

    it("should handle partial copy when count exceeds available data", () => {
      const functions = createSeries(context);
      const dst: number[] = [];
      const result = functions.CopyClose("GBPUSD", 15, 3, 5, dst); // start at 3, copy 5
      
      expect(result).toBe(2); // only 2 bars available from index 3
      expect(dst[0]).toBe(1.2);
      expect(dst[1]).toBe(1.25);
    });
  });

  describe("RefreshRates", () => {
    it("should return true", () => {
      const functions = createSeries(context);
      const result = functions.RefreshRates();
      expect(result).toBe(true);
    });
  });

  describe("SeriesInfoInteger", () => {
    it("should return correct bar count", () => {
      const functions = createSeries(context);
      const result = functions.SeriesInfoInteger("GBPUSD", 15, 0); // SERIES_BARS_COUNT
      expect(result).toBe(5);
    });

    it("should return correct first date", () => {
      const functions = createSeries(context);
      const result = functions.SeriesInfoInteger("GBPUSD", 15, 1); // SERIES_FIRSTDATE
      expect(result).toBe(1000);
    });

    it("should return correct last date", () => {
      const functions = createSeries(context);
      const result = functions.SeriesInfoInteger("GBPUSD", 15, 2); // SERIES_LASTDATE
      expect(result).toBe(5000);
    });

    it("should return synchronized status", () => {
      const functions = createSeries(context);
      const result = functions.SeriesInfoInteger("GBPUSD", 15, 3); // SERIES_SYNCHRONIZED
      expect(result).toBe(1);
    });

    it("should return 0 for unknown property", () => {
      const functions = createSeries(context);
      const result = functions.SeriesInfoInteger("GBPUSD", 15, 999);
      expect(result).toBe(0);
    });
  });

  describe("Context handling", () => {
    it("should handle missing market data", () => {
      const contextWithoutMarket: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
        indicators: new IndicatorCache(),
      };
      
      const functions = createSeries(contextWithoutMarket);
      
      expect(functions.Bars("GBPUSD", 15)).toBe(0);
      expect(functions.iOpen("GBPUSD", 15, 0)).toBe(0);
      expect(functions.CopyClose("GBPUSD", 15, 0, 3, [])).toBe(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty candle array", () => {
      const emptyMarketData = new InMemoryMarketData(
        {},
        { "EMPTY": { 15: [] } }
      );
      
      const contextWithEmptyMarket: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: emptyMarketData,
        indicators: new IndicatorCache(),
      };
      
      const functions = createSeries(contextWithEmptyMarket);
      
      expect(functions.Bars("EMPTY", 15)).toBe(0);
      expect(functions.iOpen("EMPTY", 15, 0)).toBe(0);
      expect(functions.CopyClose("EMPTY", 15, 0, 3, [])).toBe(0);
    });

    it("should handle negative shift values", () => {
      const functions = createSeries(context);
      // 負のシフトは最新のバーを指す
      expect(functions.iOpen("GBPUSD", 15, -1)).toBe(1.0);
      expect(functions.iClose("GBPUSD", 15, -1)).toBe(1.05);
    });

    it("should handle large shift values", () => {
      const functions = createSeries(context);
      expect(functions.iOpen("GBPUSD", 15, 1000)).toBe(0);
      expect(functions.iClose("GBPUSD", 15, 1000)).toBe(0);
    });
  });
});
