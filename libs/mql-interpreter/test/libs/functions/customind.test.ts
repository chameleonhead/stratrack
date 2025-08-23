import { describe, it, expect, beforeEach } from "vitest";
import { createCustomInd } from "../../../src/libs/functions/customind";
import type { ExecutionContext } from "../../../src/libs/domain/types";

describe("customind functions", () => {
  let context: ExecutionContext;

  beforeEach(() => {
    context = {
      terminal: null,
      broker: null,
      account: null,
      market: null,
      symbol: "GBPUSD",
      timeframe: 15,
    };
  });

  describe("HideTestIndicators", () => {
    it("should set hideTestIndicators to true by default", () => {
      const functions = createCustomInd(context);
      functions.HideTestIndicators();
      expect(context.hideTestIndicators).toBe(true);
    });

    it("should set hideTestIndicators to specified value", () => {
      const functions = createCustomInd(context);
      functions.HideTestIndicators(false);
      expect(context.hideTestIndicators).toBe(false);
    });
  });

  describe("IndicatorBuffers", () => {
    it("should create empty arrays for specified count", () => {
      const functions = createCustomInd(context);
      functions.IndicatorBuffers(3);
      expect(context.indicatorBuffers).toHaveLength(3);
      expect(context.indicatorBuffers![0]).toEqual([]);
      expect(context.indicatorBuffers![1]).toEqual([]);
      expect(context.indicatorBuffers![2]).toEqual([]);
    });

    it("should overwrite existing buffers", () => {
      const functions = createCustomInd(context);
      functions.IndicatorBuffers(2);
      functions.IndicatorBuffers(4);
      expect(context.indicatorBuffers).toHaveLength(4);
    });
  });

  describe("IndicatorCounted", () => {
    it("should return default value of 0", () => {
      const functions = createCustomInd(context);
      expect(functions.IndicatorCounted()).toBe(0);
    });

    it("should return updated value", () => {
      const functions = createCustomInd(context);
      context.indicatorCounted = 42;
      expect(functions.IndicatorCounted()).toBe(42);
    });
  });

  describe("IndicatorDigits", () => {
    it("should set indicatorDigits", () => {
      const functions = createCustomInd(context);
      functions.IndicatorDigits(3);
      expect(context.indicatorDigits).toBe(3);
    });

    it("should have default value of 5", () => {
      const functions = createCustomInd(context);
      expect(context.indicatorDigits).toBe(5);
    });
  });

  describe("IndicatorSetDouble", () => {
    it("should not throw error for any property", () => {
      const functions = createCustomInd(context);
      expect(() => functions.IndicatorSetDouble(0, 1.5)).not.toThrow();
      expect(() => functions.IndicatorSetDouble(999, 2.7)).not.toThrow();
    });
  });

  describe("IndicatorSetInteger", () => {
    it("should set indicatorDigits when prop is 0", () => {
      const functions = createCustomInd(context);
      functions.IndicatorSetInteger(0, 4);
      expect(context.indicatorDigits).toBe(4);
    });

    it("should not throw error for other properties", () => {
      const functions = createCustomInd(context);
      expect(() => functions.IndicatorSetInteger(1, 10)).not.toThrow();
      expect(() => functions.IndicatorSetInteger(999, 20)).not.toThrow();
    });
  });

  describe("IndicatorSetString", () => {
    it("should set indicatorShortName when prop is 0", () => {
      const functions = createCustomInd(context);
      functions.IndicatorSetString(0, "Test Indicator");
      expect(context.indicatorShortName).toBe("Test Indicator");
    });

    it("should not throw error for other properties", () => {
      const functions = createCustomInd(context);
      expect(() => functions.IndicatorSetString(1, "Other")).not.toThrow();
      expect(() => functions.IndicatorSetString(999, "Unknown")).not.toThrow();
    });
  });

  describe("IndicatorShortName", () => {
    it("should set indicatorShortName", () => {
      const functions = createCustomInd(context);
      functions.IndicatorShortName("My Indicator");
      expect(context.indicatorShortName).toBe("My Indicator");
    });

    it("should have default empty string", () => {
      const functions = createCustomInd(context);
      expect(context.indicatorShortName).toBe("");
    });
  });

  describe("SetIndexArrow", () => {
    it("should set arrow for specified index", () => {
      const functions = createCustomInd(context);
      functions.SetIndexArrow(0, 233);
      expect(context.indexArrows![0]).toBe(233);
    });

    it("should overwrite existing arrow", () => {
      const functions = createCustomInd(context);
      functions.SetIndexArrow(1, 100);
      functions.SetIndexArrow(1, 200);
      expect(context.indexArrows![1]).toBe(200);
    });
  });

  describe("SetIndexBuffer", () => {
    it("should set buffer for valid index", () => {
      const functions = createCustomInd(context);
      functions.IndicatorBuffers(2);
      const buffer = [1.1, 2.2, 3.3];
      functions.SetIndexBuffer(0, buffer);
      expect(context.indicatorBuffers![0]).toBe(buffer);
    });

    it("should not set buffer for invalid index", () => {
      const functions = createCustomInd(context);
      functions.IndicatorBuffers(1);
      const buffer = [1.1, 2.2];
      functions.SetIndexBuffer(5, buffer);
      expect(context.indicatorBuffers![5]).toBeUndefined();
    });
  });

  describe("SetIndexDrawBegin", () => {
    it("should set draw begin for specified index", () => {
      const functions = createCustomInd(context);
      functions.SetIndexDrawBegin(0, 10);
      expect(context.indexDrawBegins![0]).toBe(10);
    });
  });

  describe("SetIndexEmptyValue", () => {
    it("should set empty value for specified index", () => {
      const functions = createCustomInd(context);
      functions.SetIndexEmptyValue(0, -1);
      expect(context.indexEmptyValues![0]).toBe(-1);
    });
  });

  describe("SetIndexLabel", () => {
    it("should set label for specified index", () => {
      const functions = createCustomInd(context);
      functions.SetIndexLabel(0, "Price Line");
      expect(context.indexLabels![0]).toBe("Price Line");
    });
  });

  describe("SetIndexShift", () => {
    it("should set shift for specified index", () => {
      const functions = createCustomInd(context);
      functions.SetIndexShift(0, 2);
      expect(context.indexShifts![0]).toBe(2);
    });
  });

  describe("SetIndexStyle", () => {
    it("should set style with default width and color", () => {
      const functions = createCustomInd(context);
      functions.SetIndexStyle(0, 1);
      expect(context.indexStyles![0]).toEqual({ style: 1, width: 1, color: 0 });
    });

    it("should set style with custom width and color", () => {
      const functions = createCustomInd(context);
      functions.SetIndexStyle(1, 2, 3, 4);
      expect(context.indexStyles![1]).toEqual({ style: 2, width: 3, color: 4 });
    });
  });

  describe("SetLevelStyle", () => {
    it("should set level style with default width and color", () => {
      const functions = createCustomInd(context);
      functions.SetLevelStyle(0, 1);
      expect(context.levelStyles![0]).toEqual({ style: 1, width: 1, color: 0 });
    });

    it("should set level style with custom width and color", () => {
      const functions = createCustomInd(context);
      functions.SetLevelStyle(1, 2, 3, 4);
      expect(context.levelStyles![1]).toEqual({ style: 2, width: 3, color: 4 });
    });
  });

  describe("SetLevelValue", () => {
    it("should set level value", () => {
      const functions = createCustomInd(context);
      functions.SetLevelValue(0, 1.5);
      expect(context.levelValues![0]).toBe(1.5);
    });
  });

  describe("Helper functions", () => {
    it("should get internal state", () => {
      const functions = createCustomInd(context);
      context.indicatorDigits = 3;
      context.indicatorShortName = "Test";
      
      const state = functions._getInternalState();
      expect(state.indicatorDigits).toBe(3);
      expect(state.indicatorShortName).toBe("Test");
    });

    it("should set internal state", () => {
      const functions = createCustomInd(context);
      const newState = {
        indicatorDigits: 4,
        indicatorShortName: "New Name",
        hideTestIndicators: true,
      };
      
      functions._setInternalState(newState);
      expect(context.indicatorDigits).toBe(4);
      expect(context.indicatorShortName).toBe("New Name");
      expect(context.hideTestIndicators).toBe(true);
    });
  });

  describe("Context initialization", () => {
    it("should initialize context properties on first call", () => {
      const emptyContext: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
      };
      
      const functions = createCustomInd(emptyContext);
      
      expect(emptyContext.hideTestIndicators).toBe(false);
      expect(emptyContext.indicatorBuffers).toEqual([]);
      expect(emptyContext.indicatorCounted).toBe(0);
      expect(emptyContext.indicatorDigits).toBe(5);
      expect(emptyContext.indicatorShortName).toBe("");
      expect(emptyContext.indexArrows).toEqual({});
      expect(emptyContext.indexDrawBegins).toEqual({});
      expect(emptyContext.indexEmptyValues).toEqual({});
      expect(emptyContext.indexLabels).toEqual({});
      expect(emptyContext.indexShifts).toEqual({});
      expect(emptyContext.indexStyles).toEqual({});
      expect(emptyContext.levelStyles).toEqual({});
      expect(emptyContext.levelValues).toEqual({});
    });

    it("should not overwrite existing context properties", () => {
      const existingContext: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
        indicatorDigits: 8,
        indicatorShortName: "Existing",
      };
      
      const functions = createCustomInd(existingContext);
      
      expect(existingContext.indicatorDigits).toBe(8);
      expect(existingContext.indicatorShortName).toBe("Existing");
    });
  });
});
