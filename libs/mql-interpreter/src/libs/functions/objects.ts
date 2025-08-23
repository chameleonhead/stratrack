/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";

export function createObjects(context: ExecutionContext): Record<string, BuiltinFunction> {
  // チャートオブジェクトを管理するための内部ストレージ
  // 実際の実装では、ExecutionContextのterminalを使用する必要があります
  const objects = new Map<string, any>();

  return {
    // オブジェクトの作成
    ObjectCreate: (
      chartId: number = 0,
      objectName: string,
      objectType: number,
      subWindow: number,
      time1: number,
      price1: number,
      time2?: number,
      price2?: number,
      time3?: number,
      price3?: number
    ) => {
      if (!context.terminal) return false;

      // オブジェクトの作成を試行
      try {
        const obj = {
          name: objectName,
          type: objectType,
          subWindow,
          time1,
          price1,
          time2,
          price2,
          time3,
          price3,
          properties: {},
        };

        objects.set(objectName, obj);
        return true;
      } catch {
        return false;
      }
    },

    // オブジェクトの削除
    ObjectDelete: (chartId: number = 0, objectName: string) => {
      if (!context.terminal) return false;

      return objects.delete(objectName);
    },

    // オブジェクトの説明を取得
    ObjectDescription: (chartId: number = 0, objectName: string) => {
      if (!context.terminal) return "";

      const obj = objects.get(objectName);
      return obj?.properties?.text || "";
    },

    // オブジェクトの検索
    ObjectFind: (chartId: number = 0, objectName: string) => {
      if (!context.terminal) return -1;

      return objects.has(objectName) ? 0 : -1;
    },

    // オブジェクトのプロパティ値を取得
    ObjectGet: (chartId: number = 0, objectName: string, index: number) => {
      if (!context.terminal) return 0;

      const obj = objects.get(objectName);
      if (!obj) return 0;

      // インデックスに応じて値を返す
      switch (index) {
        case 0:
          return obj.time1 || 0;
        case 1:
          return obj.price1 || 0;
        case 2:
          return obj.time2 || 0;
        case 3:
          return obj.price2 || 0;
        case 4:
          return obj.time3 || 0;
        case 5:
          return obj.price3 || 0;
        default:
          return 0;
      }
    },

    // オブジェクトの倍精度プロパティ値を取得
    ObjectGetDouble: (
      chartId: number = 0,
      objectName: string,
      propId: number,
      propModifier: number = 0
    ) => {
      if (!context.terminal) return 0;

      const obj = objects.get(objectName);
      if (!obj) return 0;

      // プロパティIDに応じて値を返す
      switch (propId) {
        case 0:
          return obj.price1 || 0;
        case 1:
          return obj.price2 || 0;
        case 2:
          return obj.price3 || 0;
        default:
          return 0;
      }
    },

    // フィボナッチオブジェクトのレベル説明を取得
    ObjectGetFiboDescription: (chartId: number = 0, objectName: string, index: number) => {
      if (!context.terminal) return "";

      const obj = objects.get(objectName);
      if (!obj || obj.type !== 1) return ""; // 1 = OBJ_FIBO

      return obj.properties?.fiboDescriptions?.[index] || "";
    },

    // オブジェクトの整数プロパティ値を取得
    ObjectGetInteger: (
      chartId: number = 0,
      objectName: string,
      propId: number,
      propModifier: number = 0
    ) => {
      if (!context.terminal) return 0;

      const obj = objects.get(objectName);
      if (!obj) return 0;

      // プロパティIDに応じて値を返す
      switch (propId) {
        case 0:
          return obj.type || 0;
        case 1:
          return obj.subWindow || 0;
        default:
          return 0;
      }
    },

    // 価格値からバーインデックスを取得
    ObjectGetShiftByValue: (chartId: number = 0, objectName: string, value: number) => {
      if (!context.terminal) return -1;

      const obj = objects.get(objectName);
      if (!obj) return -1;

      // 簡易実装：価格に基づいてインデックスを計算
      if (obj.price1 !== undefined && obj.price2 !== undefined) {
        const ratio = (value - obj.price1) / (obj.price2 - obj.price1);
        return Math.round(ratio * 100);
      }

      return -1;
    },

    // オブジェクトの文字列プロパティ値を取得
    ObjectGetString: (
      chartId: number = 0,
      objectName: string,
      propId: number,
      propModifier: number = 0
    ) => {
      if (!context.terminal) return "";

      const obj = objects.get(objectName);
      if (!obj) return "";

      // プロパティIDに応じて値を返す
      switch (propId) {
        case 0:
          return obj.name || "";
        case 1:
          return obj.properties?.text || "";
        default:
          return "";
      }
    },

    // 価格値から時間値を取得
    ObjectGetTimeByValue: (
      chartId: number = 0,
      objectName: string,
      value: number,
      lineId: number = 0
    ) => {
      if (!context.terminal) return 0;

      const obj = objects.get(objectName);
      if (!obj) return 0;

      // 簡易実装：価格に基づいて時間を計算
      if (
        obj.price1 !== undefined &&
        obj.price2 !== undefined &&
        obj.time1 !== undefined &&
        obj.time2 !== undefined
      ) {
        const ratio = (value - obj.price1) / (obj.price2 - obj.price1);
        return obj.time1 + Math.round(ratio * (obj.time2 - obj.time1));
      }

      return 0;
    },

    // バーインデックスから価格値を取得
    ObjectGetValueByShift: (chartId: number = 0, objectName: string, shift: number) => {
      if (!context.terminal) return 0;

      const obj = objects.get(objectName);
      if (!obj) return 0;

      // 簡易実装：シフトに基づいて価格を計算
      if (obj.price1 !== undefined && obj.price2 !== undefined) {
        const ratio = shift / 100;
        return obj.price1 + ratio * (obj.price2 - obj.price1);
      }

      return 0;
    },

    // 時間値から価格値を取得
    ObjectGetValueByTime: (
      chartId: number = 0,
      objectName: string,
      time: number,
      lineId: number = 0
    ) => {
      if (!context.terminal) return 0;

      const obj = objects.get(objectName);
      if (!obj) return 0;

      // 簡易実装：時間に基づいて価格を計算
      if (
        obj.price1 !== undefined &&
        obj.price2 !== undefined &&
        obj.time1 !== undefined &&
        obj.time2 !== undefined
      ) {
        const ratio = (time - obj.time1) / (obj.time2 - obj.time1);
        return obj.price1 + ratio * (obj.price2 - obj.price1);
      }

      return 0;
    },

    // オブジェクトの移動
    ObjectMove: (
      chartId: number = 0,
      objectName: string,
      pointIndex: number,
      time: number,
      price: number
    ) => {
      if (!context.terminal) return false;

      const obj = objects.get(objectName);
      if (!obj) return false;

      // ポイントインデックスに応じて座標を更新
      switch (pointIndex) {
        case 0:
          obj.time1 = time;
          obj.price1 = price;
          break;
        case 1:
          obj.time2 = time;
          obj.price2 = price;
          break;
        case 2:
          obj.time3 = time;
          obj.price3 = price;
          break;
        default:
          return false;
      }

      return true;
    },

    // インデックスからオブジェクト名を取得
    ObjectName: (chartId: number = 0, index: number) => {
      if (!context.terminal) return "";

      const names = Array.from(objects.keys());
      return names[index] || "";
    },

    // すべてのオブジェクトを削除
    ObjectsDeleteAll: (chartId: number = 0, subWindow: number = -1, objectType: number = -1) => {
      if (!context.terminal) return 0;

      let count = 0;

      for (const [name, obj] of objects.entries()) {
        if (
          (subWindow === -1 || obj.subWindow === subWindow) &&
          (objectType === -1 || obj.type === objectType)
        ) {
          objects.delete(name);
          count++;
        }
      }

      return count;
    },

    // オブジェクトのプロパティ値を設定
    ObjectSet: (chartId: number = 0, objectName: string, index: number, value: number) => {
      if (!context.terminal) return false;

      const obj = objects.get(objectName);
      if (!obj) return false;

      // インデックスに応じて値を設定
      switch (index) {
        case 0:
          obj.time1 = value;
          break;
        case 1:
          obj.price1 = value;
          break;
        case 2:
          obj.time2 = value;
          break;
        case 3:
          obj.price2 = value;
          break;
        case 4:
          obj.time3 = value;
          break;
        case 5:
          obj.price3 = value;
          break;
        default:
          return false;
      }

      return true;
    },

    // オブジェクトの倍精度プロパティ値を設定
    ObjectSetDouble: (
      chartId: number = 0,
      objectName: string,
      propId: number,
      value: number,
      propModifier?: number
    ) => {
      if (!context.terminal) return false;

      const obj = objects.get(objectName);
      if (!obj) return false;

      if (!obj.properties) obj.properties = {};

      // プロパティIDに応じて値を設定
      switch (propId) {
        case 0:
          obj.price1 = value;
          break;
        case 1:
          obj.price2 = value;
          break;
        case 2:
          obj.price3 = value;
          break;
        default:
          return false;
      }

      return true;
    },

    // フィボナッチオブジェクトのレベル説明を設定
    ObjectSetFiboDescription: (
      chartId: number = 0,
      objectName: string,
      index: number,
      text: string
    ) => {
      if (!context.terminal) return false;

      const obj = objects.get(objectName);
      if (!obj || obj.type !== 1) return false; // 1 = OBJ_FIBO

      if (!obj.properties.fiboDescriptions) obj.properties.fiboDescriptions = {};
      obj.properties.fiboDescriptions[index] = text;

      return true;
    },

    // オブジェクトの整数プロパティ値を設定
    ObjectSetInteger: (
      chartId: number = 0,
      objectName: string,
      propId: number,
      value: number,
      propModifier?: number
    ) => {
      if (!context.terminal) return false;

      const obj = objects.get(objectName);
      if (!obj) return false;

      if (!obj.properties) obj.properties = {};

      // プロパティIDに応じて値を設定
      switch (propId) {
        case 0:
          obj.type = value;
          break;
        case 1:
          obj.subWindow = value;
          break;
        default:
          return false;
      }

      return true;
    },

    // オブジェクトの文字列プロパティ値を設定
    ObjectSetString: (
      chartId: number = 0,
      objectName: string,
      propId: number,
      value: string,
      propModifier?: number
    ) => {
      if (!context.terminal) return false;

      const obj = objects.get(objectName);
      if (!obj) return false;

      if (!obj.properties) obj.properties = {};

      // プロパティIDに応じて値を設定
      switch (propId) {
        case 0:
          obj.name = value;
          break;
        case 1:
          obj.properties.text = value;
          break;
        default:
          return false;
      }

      return true;
    },

    // オブジェクトのテキストを設定
    ObjectSetText: (
      chartId: number = 0,
      objectName: string,
      text: string,
      fontSize: number = 10,
      fontName: string = "Arial",
      textColor: number = 0
    ) => {
      if (!context.terminal) return false;

      const obj = objects.get(objectName);
      if (!obj) return false;

      if (!obj.properties) obj.properties = {};
      obj.properties.text = text;
      obj.properties.fontSize = fontSize;
      obj.properties.fontName = fontName;
      obj.properties.textColor = textColor;

      return true;
    },

    // オブジェクトの総数を取得
    ObjectsTotal: (chartId: number = 0, subWindow: number = -1, type: number = -1) => {
      if (!context.terminal) return 0;

      let count = 0;

      for (const obj of objects.values()) {
        if (
          (subWindow === -1 || obj.subWindow === subWindow) &&
          (type === -1 || obj.type === type)
        ) {
          count++;
        }
      }

      return count;
    },

    // オブジェクトのタイプを取得
    ObjectType: (chartId: number = 0, objectName: string) => {
      if (!context.terminal) return -1;

      const obj = objects.get(objectName);
      return obj?.type || -1;
    },

    // テキストのサイズを取得
    TextGetSize: (text: string, width: number, height: number) => {
      if (!context.terminal) return false;

      // 簡易実装：テキストの長さに基づいてサイズを設定
      width = text.length * 8; // 概算の幅
      height = 16; // 概算の高さ

      return true;
    },

    // テキストを出力
    TextOut: (
      text: string,
      x: number,
      y: number,
      anchor: number,
      data: number[],
      width: number,
      height: number,
      color: number,
      colorFormat: number
    ) => {
      if (!context.terminal) return false;

      // 簡易実装：テキスト出力をシミュレート
      return true;
    },

    // フォントを設定
    TextSetFont: (name: string, size: number, flags: number = 0, orientation: number = 0) => {
      if (!context.terminal) return false;

      // 簡易実装：フォント設定をシミュレート
      return true;
    },
  };
}
