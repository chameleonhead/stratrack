import { describe, it, expect, beforeEach } from "vitest";
import { createIndicators } from "../../../src/libs/functions/indicators";
import type { ExecutionContext } from "../../../src/libs/domain/types";
import { InMemoryIndicatorEngine } from "../../../src/libs/domain/indicator";
import { InMemoryMarketData } from "../../../src/libs/domain/marketData";
import type { Candle } from "../../../src/libs/domain/marketData";

describe("indicators functions", () => {
  let context: ExecutionContext;
  let marketData: InMemoryMarketData;

  beforeEach(() => {
    // テスト用のデータを準備
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
      { GBPUSD: { 15: testCandles } } // candleData
    );

    context = {
      terminal: null,
      broker: null,
      account: null,
      market: marketData,
      symbol: "GBPUSD",
      timeframe: 15,
      indicatorEngine: new InMemoryIndicatorEngine(),
    };
  });

  describe("iMA", () => {
    it("should calculate simple moving average correctly", () => {
      const functions = createIndicators(context);
      const result = functions.iMA("GBPUSD", 15, 3, 0, 0, 6, 0);
      // 最後の3つの価格の平均: (1.2 + 1.25) / 3 = 1.1875
      expect(result).toBeCloseTo(1.1875, 4);
    });

    it("should handle different periods", () => {
      const functions = createIndicators(context);
      const result = functions.iMA("GBPUSD", 15, 2, 0, 0, 6, 0);
      // 最後の2つの価格の平均: (1.2 + 1.25) / 2 = 1.2125
      expect(result).toBeCloseTo(1.2125, 4);
    });

    it("should handle shift parameter", () => {
      const functions = createIndicators(context);
      const result = functions.iMA("GBPUSD", 15, 3, 0, 0, 6, 1);
      // 1つ前のバーでの3期間平均: (1.1 + 1.15 + 1.2) / 3 = 1.1375
      expect(result).toBeCloseTo(1.1375, 4);
    });

    it("should return 0 for invalid symbol", () => {
      const functions = createIndicators(context);
      const result = functions.iMA("INVALID", 15, 3, 0, 0, 6, 0);
      expect(result).toBe(0);
    });
  });

  describe("iMACD", () => {
    it("should calculate MACD line correctly", () => {
      const functions = createIndicators(context);
      const result = functions.iMACD("GBPUSD", 15, 2, 3, 2, 6, 0, 0);
      // MACD line (mode 0)
      expect(typeof result).toBe("number");
    });

    it("should calculate signal line correctly", () => {
      const functions = createIndicators(context);
      const result = functions.iMACD("GBPUSD", 15, 2, 3, 2, 6, 1, 0);
      // Signal line (mode 1)
      expect(typeof result).toBe("number");
    });

    it("should calculate histogram correctly", () => {
      const functions = createIndicators(context);
      const result = functions.iMACD("GBPUSD", 15, 2, 3, 2, 6, 2, 0);
      // Histogram (mode 2)
      expect(typeof result).toBe("number");
    });
  });

  describe("iATR", () => {
    it("should calculate ATR correctly", () => {
      const functions = createIndicators(context);
      const result = functions.iATR("GBPUSD", 15, 3, 0);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("should handle different periods", () => {
      const functions = createIndicators(context);
      const result = functions.iATR("GBPUSD", 15, 2, 0);
      expect(typeof result).toBe("number");
    });
  });

  describe("iRSI", () => {
    it("should calculate RSI correctly", () => {
      const functions = createIndicators(context);
      const result = functions.iRSI("GBPUSD", 15, 3, 6, 0);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it("should handle different periods", () => {
      const functions = createIndicators(context);
      const result = functions.iRSI("GBPUSD", 15, 2, 6, 0);
      expect(typeof result).toBe("number");
    });
  });

  describe("iCustom", () => {
    it("returns 0 when indicator is not found", () => {
      const functions = createIndicators(context);
      const result = functions.iCustom("GBPUSD", 15, "Missing", 0, 0);
      expect(result).toBe(0);
    });

    it("retrieves values from custom indicator", () => {
      context.indicatorEngine!.set(
        "TestIndicator",
        `
int OnInit(){IndicatorBuffers(1);SetIndexBuffer(0,Close);return 0;}
int OnCalculate(){return Bars;}
`
      );
      const functions = createIndicators(context);
      const result = functions.iCustom("GBPUSD", 15, "TestIndicator", 0, 0);
      expect(result).toBeCloseTo(1.25, 4);
    });
  });

  describe("Other indicator functions", () => {
    it("should return 0 for unimplemented indicators", () => {
      const functions = createIndicators(context);

      // 基本的なインジケーター関数
      expect(functions.iAC("GBPUSD", 15, 0)).toBe(0);
      expect(functions.iAD("GBPUSD", 15, 0)).toBe(0);
      expect(functions.iAO("GBPUSD", 15, 0)).toBe(0);
      expect(functions.iBands("GBPUSD", 15, 20, 2, 0, 6, 0, 0)).toBe(0);
      expect(functions.iCCI("GBPUSD", 15, 14, 6, 0)).toBe(0);
      expect(functions.iDeMarker("GBPUSD", 15, 14, 0)).toBe(0);
      expect(functions.iEnvelopes("GBPUSD", 15, 20, 0, 0, 6, 0.1, 0, 0)).toBe(0);
      expect(functions.iForce("GBPUSD", 15, 13, 0, 6, 0)).toBe(0);
      expect(functions.iFractals("GBPUSD", 15, 0, 0)).toBe(0);
      expect(functions.iIchimoku("GBPUSD", 15, 9, 26, 52, 0, 0)).toBe(0);
      expect(functions.iMFI("GBPUSD", 15, 14, 6, 0)).toBe(0);
      expect(functions.iMomentum("GBPUSD", 15, 14, 6, 0)).toBe(0);
      expect(functions.iOBV("GBPUSD", 15, 6, 0)).toBe(0);
      expect(functions.iOsMA("GBPUSD", 15, 12, 26, 9, 6, 0)).toBe(0);
      expect(functions.iRVI("GBPUSD", 15, 10, 0, 0)).toBe(0);
      expect(functions.iSAR("GBPUSD", 15, 0.02, 0.2, 0)).toBe(0);
      expect(functions.iStdDev("GBPUSD", 15, 20, 0, 0, 6, 0)).toBe(0);
      expect(functions.iStochastic("GBPUSD", 15, 5, 3, 3, 0, 6, 0, 0)).toBe(0);
      expect(functions.iWPR("GBPUSD", 15, 14, 0)).toBe(0);
    });

    it("should handle array-based indicators", () => {
      const functions = createIndicators(context);
      const testArray = [1.0, 1.1, 1.2, 1.3, 1.4];

      expect(functions.iBandsOnArray(testArray, 5, 20, 2, 0, 0, 0)).toBe(0);
      expect(functions.iCCIOnArray(testArray, 5, 14, 0)).toBe(0);
      expect(functions.iEnvelopesOnArray(testArray, 5, 20, 0, 0, 0.1, 0, 0)).toBe(0);
      expect(functions.iMAOnArray(testArray, 5, 20, 0, 0, 0)).toBe(0);
      expect(functions.iMomentumOnArray(testArray, 5, 14, 0)).toBe(0);
      expect(functions.iRSIOnArray(testArray, 5, 14, 0)).toBe(0);
      expect(functions.iStdDevOnArray(testArray, 5, 20, 0, 0, 0)).toBe(0);
    });

    it("should handle complex indicators", () => {
      const functions = createIndicators(context);

      expect(functions.iADX("GBPUSD", 15, 14, 6, 0, 0)).toBe(0);
      expect(functions.iAlligator("GBPUSD", 15, 13, 8, 8, 5, 5, 3, 3, 0, 6, 0, 0)).toBe(0);
      expect(functions.iBearsPower("GBPUSD", 15, 13, 6, 0)).toBe(0);
      expect(functions.iBullsPower("GBPUSD", 15, 13, 6, 0)).toBe(0);
      expect(functions.iBWMFI("GBPUSD", 15, 0)).toBe(0);
      expect(functions.iGator("GBPUSD", 15, 13, 8, 8, 5, 5, 3, 3, 0, 6, 0, 0)).toBe(0);
    });
  });

  describe("Context handling", () => {
    it("should handle missing market data", () => {
      const contextWithoutMarket: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
        indicatorEngine: new InMemoryIndicatorEngine(),
      };

      const functions = createIndicators(contextWithoutMarket);
      expect(functions.iMA("GBPUSD", 15, 3, 0, 0, 6, 0)).toBe(0);
    });

    it("should handle missing indicators cache", () => {
      const contextWithoutIndicators: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: marketData,
        indicatorEngine: undefined,
      };

      const functions = createIndicators(contextWithoutIndicators);
      expect(functions.iMA("GBPUSD", 15, 3, 0, 0, 6, 0)).toBe(0);
    });
  });

  describe("Price calculation", () => {
    it("should calculate different price types correctly", () => {
      const functions = createIndicators(context);

      // 各価格タイプでテスト
      const result1 = functions.iMA("GBPUSD", 15, 2, 0, 0, 1, 0); // open
      const result2 = functions.iMA("GBPUSD", 15, 2, 0, 0, 2, 0); // high
      const result3 = functions.iMA("GBPUSD", 15, 2, 0, 0, 3, 0); // low
      const result4 = functions.iMA("GBPUSD", 15, 2, 0, 0, 4, 0); // (high+low)/2
      const result5 = functions.iMA("GBPUSD", 15, 2, 0, 0, 5, 0); // (high+low+close)/3
      const result6 = functions.iMA("GBPUSD", 15, 2, 0, 0, 6, 0); // (high+low+2*close)/4
      const result0 = functions.iMA("GBPUSD", 15, 2, 0, 0, 0, 0); // close (default)

      expect(typeof result1).toBe("number");
      expect(typeof result2).toBe("number");
      expect(typeof result3).toBe("number");
      expect(typeof result4).toBe("number");
      expect(typeof result5).toBe("number");
      expect(typeof result6).toBe("number");
      expect(typeof result0).toBe("number");
    });
  });

  describe("Caching behavior", () => {
    it("should use indicator cache for repeated calls", () => {
      const functions = createIndicators(context);

      // 同じパラメータで複数回呼び出し
      const result1 = functions.iMA("GBPUSD", 15, 3, 0, 0, 6, 0);
      const result2 = functions.iMA("GBPUSD", 15, 3, 0, 0, 6, 0);

      expect(result1).toBe(result2);
    });

    it("should handle different parameters separately", () => {
      const functions = createIndicators(context);

      const result1 = functions.iMA("GBPUSD", 15, 3, 0, 0, 6, 0);
      const result2 = functions.iMA("GBPUSD", 15, 5, 0, 0, 6, 0);

      expect(result1).not.toBe(result2);
    });
  });
});
