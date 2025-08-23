import { describe, it, expect, beforeEach } from "vitest";
import { createObjects } from "../../../src/libs/functions/objects";
import type { ExecutionContext } from "../../../src/libs/domain/types";

describe("objects functions", () => {
  let context: ExecutionContext;

  beforeEach(() => {
    context = {
      terminal: {} as any, // モックのterminal
      broker: null,
      account: null,
      market: null,
      symbol: "GBPUSD",
      timeframe: 15,
    };
  });

  describe("ObjectCreate", () => {
    it("should create an object successfully", () => {
      const functions = createObjects(context);
      const result = functions.ObjectCreate(0, "TestLine", 1, 0, 1000, 1.2000, 2000, 1.2500);
      expect(result).toBe(true);
    });

    it("should return false when terminal is null", () => {
      const contextWithoutTerminal: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
      };
      const functions = createObjects(contextWithoutTerminal);
      const result = functions.ObjectCreate(0, "TestLine", 1, 0, 1000, 1.2000);
      expect(result).toBe(false);
    });

    it("should handle optional parameters", () => {
      const functions = createObjects(context);
      const result = functions.ObjectCreate(0, "TestObject", 2, 0, 1000, 1.2000, 2000, 1.2500, 3000, 1.3000);
      expect(result).toBe(true);
    });
  });

  describe("ObjectDelete", () => {
    it("should delete an existing object", () => {
      const functions = createObjects(context);
      // まずオブジェクトを作成
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      // 次に削除
      const result = functions.ObjectDelete(0, "TestObject");
      expect(result).toBe(true);
    });

    it("should return false when terminal is null", () => {
      const contextWithoutTerminal: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
      };
      const functions = createObjects(contextWithoutTerminal);
      const result = functions.ObjectDelete(0, "TestObject");
      expect(result).toBe(false);
    });

    it("should handle non-existent object", () => {
      const functions = createObjects(context);
      const result = functions.ObjectDelete(0, "NonExistentObject");
      expect(result).toBe(false);
    });
  });

  describe("ObjectDescription", () => {
    it("should return object description", () => {
      const functions = createObjects(context);
      // オブジェクトを作成
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      // 説明を設定
      functions.ObjectSetText(0, "TestObject", "Test Description");
      // 説明を取得
      const result = functions.ObjectDescription(0, "TestObject");
      expect(result).toBe("Test Description");
    });

    it("should return empty string when terminal is null", () => {
      const contextWithoutTerminal: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
      };
      const functions = createObjects(contextWithoutTerminal);
      const result = functions.ObjectDescription(0, "TestObject");
      expect(result).toBe("");
    });
  });

  describe("ObjectFind", () => {
    it("should find existing object", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      const result = functions.ObjectFind(0, "TestObject");
      expect(result).toBe(0);
    });

    it("should return -1 for non-existent object", () => {
      const functions = createObjects(context);
      const result = functions.ObjectFind(0, "NonExistentObject");
      expect(result).toBe(-1);
    });

    it("should return -1 when terminal is null", () => {
      const contextWithoutTerminal: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
      };
      const functions = createObjects(contextWithoutTerminal);
      const result = functions.ObjectFind(0, "TestObject");
      expect(result).toBe(-1);
    });
  });

  describe("ObjectGet", () => {
    it("should return object property values by index", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000, 2000, 1.2500);
      
      expect(functions.ObjectGet(0, "TestObject", 0)).toBe(1000); // time1
      expect(functions.ObjectGet(0, "TestObject", 1)).toBe(1.2000); // price1
      expect(functions.ObjectGet(0, "TestObject", 2)).toBe(2000); // time2
      expect(functions.ObjectGet(0, "TestObject", 3)).toBe(1.2500); // price2
    });

    it("should return 0 for invalid index", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      const result = functions.ObjectGet(0, "TestObject", 999);
      expect(result).toBe(0);
    });

    it("should return 0 when terminal is null", () => {
      const contextWithoutTerminal: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
      };
      const functions = createObjects(contextWithoutTerminal);
      const result = functions.ObjectGet(0, "TestObject", 0);
      expect(result).toBe(0);
    });
  });

  describe("ObjectGetDouble", () => {
    it("should return double property values", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000, 2000, 1.2500);
      
      expect(functions.ObjectGetDouble(0, "TestObject", 0)).toBe(1.2000); // price1
      expect(functions.ObjectGetDouble(0, "TestObject", 1)).toBe(1.2500); // price2
    });

    it("should return 0 for non-existent object", () => {
      const functions = createObjects(context);
      const result = functions.ObjectGetDouble(0, "NonExistentObject", 0);
      expect(result).toBe(0);
    });
  });

  describe("ObjectGetFiboDescription", () => {
    it("should return Fibonacci level description", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "FiboObject", 1, 0, 1000, 1.2000); // 1 = OBJ_FIBO
      functions.ObjectSetFiboDescription(0, "FiboObject", 0, "Level 0");
      
      const result = functions.ObjectGetFiboDescription(0, "FiboObject", 0);
      expect(result).toBe("Level 0");
    });

    it("should return empty string for non-Fibonacci object", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 2, 0, 1000, 1.2000); // 2 != OBJ_FIBO
      
      const result = functions.ObjectGetFiboDescription(0, "TestObject", 0);
      expect(result).toBe("");
    });
  });

  describe("ObjectGetInteger", () => {
    it("should return integer property values", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      expect(functions.ObjectGetInteger(0, "TestObject", 0)).toBe(1); // type
      expect(functions.ObjectGetInteger(0, "TestObject", 1)).toBe(0); // subWindow
    });
  });

  describe("ObjectGetShiftByValue", () => {
    it("should calculate shift by value", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000, 2000, 1.2500);
      
      const result = functions.ObjectGetShiftByValue(0, "TestObject", 1.2250);
      expect(result).toBe(50); // 中間点
    });

    it("should return -1 for non-existent object", () => {
      const functions = createObjects(context);
      const result = functions.ObjectGetShiftByValue(0, "NonExistentObject", 1.2250);
      expect(result).toBe(-1);
    });
  });

  describe("ObjectGetString", () => {
    it("should return string property values", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      functions.ObjectSetString(0, "TestObject", 1, "Test Text");
      
      expect(functions.ObjectGetString(0, "TestObject", 0)).toBe("TestObject"); // name
      expect(functions.ObjectGetString(0, "TestObject", 1)).toBe("Test Text"); // text
    });
  });

  describe("ObjectGetTimeByValue", () => {
    it("should calculate time by value", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000, 2000, 1.2500);
      
      const result = functions.ObjectGetTimeByValue(0, "TestObject", 1.2250);
      expect(result).toBe(1500); // 中間点
    });
  });

  describe("ObjectGetValueByShift", () => {
    it("should calculate value by shift", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000, 2000, 1.2500);
      
      const result = functions.ObjectGetValueByShift(0, "TestObject", 50);
      expect(result).toBe(1.2250); // 中間点
    });
  });

  describe("ObjectGetValueByTime", () => {
    it("should calculate value by time", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000, 2000, 1.2500);
      
      const result = functions.ObjectGetValueByTime(0, "TestObject", 1500);
      expect(result).toBe(1.2250); // 中間点
    });
  });

  describe("ObjectMove", () => {
    it("should move object point", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000, 2000, 1.2500);
      
      const result = functions.ObjectMove(0, "TestObject", 0, 1500, 1.2250);
      expect(result).toBe(true);
      
      // 移動後の値を確認
      expect(functions.ObjectGet(0, "TestObject", 0)).toBe(1500);
      expect(functions.ObjectGet(0, "TestObject", 1)).toBe(1.2250);
    });

    it("should return false for invalid point index", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectMove(0, "TestObject", 999, 1500, 1.2250);
      expect(result).toBe(false);
    });
  });

  describe("ObjectName", () => {
    it("should return object name by index", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "Object1", 1, 0, 1000, 1.2000);
      functions.ObjectCreate(0, "Object2", 1, 0, 2000, 1.2500);
      
      expect(functions.ObjectName(0, 0)).toBe("Object1");
      expect(functions.ObjectName(0, 1)).toBe("Object2");
    });

    it("should return empty string for invalid index", () => {
      const functions = createObjects(context);
      const result = functions.ObjectName(0, 999);
      expect(result).toBe("");
    });
  });

  describe("ObjectsDeleteAll", () => {
    it("should delete all objects", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "Object1", 1, 0, 1000, 1.2000);
      functions.ObjectCreate(0, "Object2", 1, 0, 2000, 1.2500);
      
      const count = functions.ObjectsDeleteAll(0);
      expect(count).toBe(2);
      
      // 削除後の確認
      expect(functions.ObjectsTotal(0)).toBe(0);
    });

    it("should delete objects by subwindow", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "Object1", 1, 0, 1000, 1.2000);
      functions.ObjectCreate(0, "Object2", 1, 1, 2000, 1.2500);
      
      const count = functions.ObjectsDeleteAll(0, 0);
      expect(count).toBe(1);
      
      // 削除後の確認
      expect(functions.ObjectsTotal(0, 0)).toBe(0);
      expect(functions.ObjectsTotal(0, 1)).toBe(1);
    });

    it("should delete objects by type", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "Object1", 1, 0, 1000, 1.2000);
      functions.ObjectCreate(0, "Object2", 2, 0, 2000, 1.2500);
      
      const count = functions.ObjectsDeleteAll(0, -1, 1);
      expect(count).toBe(1);
      
      // 削除後の確認
      expect(functions.ObjectsTotal(0, -1, 1)).toBe(0);
      expect(functions.ObjectsTotal(0, -1, 2)).toBe(1);
    });
  });

  describe("ObjectSet", () => {
    it("should set object property values", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectSet(0, "TestObject", 0, 1500);
      expect(result).toBe(true);
      
      // 設定後の値を確認
      expect(functions.ObjectGet(0, "TestObject", 0)).toBe(1500);
    });

    it("should return false for invalid index", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectSet(0, "TestObject", 999, 1500);
      expect(result).toBe(false);
    });
  });

  describe("ObjectSetDouble", () => {
    it("should set double property values", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectSetDouble(0, "TestObject", 0, 1.3000);
      expect(result).toBe(true);
      
      // 設定後の値を確認
      expect(functions.ObjectGetDouble(0, "TestObject", 0)).toBe(1.3000);
    });
  });

  describe("ObjectSetFiboDescription", () => {
    it("should set Fibonacci level description", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "FiboObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectSetFiboDescription(0, "FiboObject", 0, "Level 0");
      expect(result).toBe(true);
      
      // 設定後の値を確認
      expect(functions.ObjectGetFiboDescription(0, "FiboObject", 0)).toBe("Level 0");
    });

    it("should return false for non-Fibonacci object", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 2, 0, 1000, 1.2000);
      
      const result = functions.ObjectSetFiboDescription(0, "TestObject", 0, "Level 0");
      expect(result).toBe(false);
    });
  });

  describe("ObjectSetInteger", () => {
    it("should set integer property values", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectSetInteger(0, "TestObject", 0, 3);
      expect(result).toBe(true);
      
      // 設定後の値を確認
      expect(functions.ObjectGetInteger(0, "TestObject", 0)).toBe(3);
    });
  });

  describe("ObjectSetString", () => {
    it("should set string property values", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectSetString(0, "TestObject", 1, "New Text");
      expect(result).toBe(true);
      
      // 設定後の値を確認
      expect(functions.ObjectGetString(0, "TestObject", 1)).toBe("New Text");
    });
  });

  describe("ObjectSetText", () => {
    it("should set object text", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectSetText(0, "TestObject", "Test Text", 12, "Arial", 0xFF0000);
      expect(result).toBe(true);
      
      // 設定後の値を確認
      expect(functions.ObjectGetString(0, "TestObject", 1)).toBe("Test Text");
    });

    it("should use default values", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectSetText(0, "TestObject", "Test Text");
      expect(result).toBe(true);
    });
  });

  describe("ObjectsTotal", () => {
    it("should return total number of objects", () => {
      const functions = createObjects(context);
      expect(functions.ObjectsTotal(0)).toBe(0);
      
      functions.ObjectCreate(0, "Object1", 1, 0, 1000, 1.2000);
      expect(functions.ObjectsTotal(0)).toBe(1);
      
      functions.ObjectCreate(0, "Object2", 1, 0, 2000, 1.2500);
      expect(functions.ObjectsTotal(0)).toBe(2);
    });

    it("should filter by subwindow", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "Object1", 1, 0, 1000, 1.2000);
      functions.ObjectCreate(0, "Object2", 1, 1, 2000, 1.2500);
      
      expect(functions.ObjectsTotal(0, 0)).toBe(1);
      expect(functions.ObjectsTotal(0, 1)).toBe(1);
    });

    it("should filter by type", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "Object1", 1, 0, 1000, 1.2000);
      functions.ObjectCreate(0, "Object2", 2, 0, 2000, 1.2500);
      
      expect(functions.ObjectsTotal(0, -1, 1)).toBe(1);
      expect(functions.ObjectsTotal(0, -1, 2)).toBe(1);
    });
  });

  describe("ObjectType", () => {
    it("should return object type", () => {
      const functions = createObjects(context);
      functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000);
      
      const result = functions.ObjectType(0, "TestObject");
      expect(result).toBe(1);
    });

    it("should return -1 for non-existent object", () => {
      const functions = createObjects(context);
      const result = functions.ObjectType(0, "NonExistentObject");
      expect(result).toBe(-1);
    });
  });

  describe("Text functions", () => {
    it("should handle TextGetSize", () => {
      const functions = createObjects(context);
      const result = functions.TextGetSize("Test Text", 100, 20);
      expect(result).toBe(true);
    });

    it("should handle TextOut", () => {
      const functions = createObjects(context);
      const result = functions.TextOut("Test Text", 10, 20, 0, [100, 20], 100, 20, 0xFF0000, 0);
      expect(result).toBe(true);
    });

    it("should handle TextSetFont", () => {
      const functions = createObjects(context);
      const result = functions.TextSetFont("Arial", 12, 0, 0);
      expect(result).toBe(true);
    });
  });

  describe("Context handling", () => {
    it("should handle missing terminal", () => {
      const contextWithoutTerminal: ExecutionContext = {
        terminal: null,
        broker: null,
        account: null,
        market: null,
      };
      
      const functions = createObjects(contextWithoutTerminal);
      
      expect(functions.ObjectCreate(0, "TestObject", 1, 0, 1000, 1.2000)).toBe(false);
      expect(functions.ObjectDelete(0, "TestObject")).toBe(false);
      expect(functions.ObjectDescription(0, "TestObject")).toBe("");
      expect(functions.ObjectFind(0, "TestObject")).toBe(-1);
      expect(functions.ObjectsTotal(0)).toBe(0);
    });
  });
});
