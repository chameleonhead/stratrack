import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";
import type { Candle } from "../domain/marketData";

export function createSeries(context: ExecutionContext): Record<string, BuiltinFunction> {
  // ヘルパー関数
  const candlesFor = (symbol: string, timeframe: number): Candle[] => {
    if (!context.market) return [];
    return context.market.getCandles(symbol, timeframe);
  };

  const barIndex = (arr: Candle[], shift: number) => {
    if (shift < 0) return 0; // 負のシフトは最新のバーを指す
    return arr.length - 1 - shift;
  };

  return {
    // バーの総数を取得
    Bars: (symbol: string, timeframe: number) => candlesFor(symbol, timeframe).length,
    
    // バーの総数を取得（iBarsはBarsのエイリアス）
    iBars: (symbol: string, timeframe: number) => candlesFor(symbol, timeframe).length,
    
    // 指定された時間をカバーするバーのインデックスを取得
    iBarShift: (symbol: string, timeframe: number, time: number, exact?: boolean) => {
      const arr = candlesFor(symbol, timeframe);
      for (let i = 0; i < arr.length; i++) {
        const c = arr[i];
        const next = arr[i + 1];
        if (c.time === time) return i;
        if (!exact && next && c.time < time && time < next.time) return i;
      }
      return -1;
    },
    
    // 指定されたバーの始値
    iOpen: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.open ?? 0;
    },
    
    // 指定されたバーの高値
    iHigh: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.high ?? 0;
    },
    
    // 指定されたバーの安値
    iLow: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.low ?? 0;
    },
    
    // 指定されたバーの終値
    iClose: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.close ?? 0;
    },
    
    // 指定されたバーの時間
    iTime: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.time ?? 0;
    },
    
    // 指定されたバーの出来高
    iVolume: (symbol: string, timeframe: number, shift: number) => {
      const arr = candlesFor(symbol, timeframe);
      return arr[barIndex(arr, shift)]?.volume ?? 0;
    },
    
    // 指定された期間の最高値のシフトを取得
    iHighest: (symbol: string, timeframe: number, type: number, count: number, start: number = 0) => {
      const arr = candlesFor(symbol, timeframe);
      if (start + count > arr.length) return -1;
      
      let maxValue = -Infinity;
      let maxIndex = -1;
      
      for (let i = start; i < start + count; i++) {
        let value: number;
        switch (type) {
          case 0: value = arr[i].high; break;   // PRICE_HIGH
          case 1: value = arr[i].low; break;    // PRICE_LOW
          case 2: value = arr[i].close; break;  // PRICE_CLOSE
          case 3: value = arr[i].open; break;   // PRICE_OPEN
          case 4: value = arr[i].volume ?? 0; break; // PRICE_VOLUME
          default: value = arr[i].close; break;
        }
        
        if (value > maxValue) {
          maxValue = value;
          maxIndex = i;
        }
      }
      
      return maxIndex;
    },
    
    // 指定された期間の最安値のシフトを取得
    iLowest: (symbol: string, timeframe: number, type: number, count: number, start: number = 0) => {
      const arr = candlesFor(symbol, timeframe);
      if (start + count > arr.length) return -1;
      
      let minValue = Infinity;
      let minIndex = -1;
      
      for (let i = start; i < start + count; i++) {
        let value: number;
        switch (type) {
          case 0: value = arr[i].high; break;   // PRICE_HIGH
          case 1: value = arr[i].low; break;    // PRICE_LOW
          case 2: value = arr[i].close; break;  // PRICE_CLOSE
          case 3: value = arr[i].open; break;   // PRICE_OPEN
          case 4: value = arr[i].volume ?? 0; break; // PRICE_VOLUME
          default: value = arr[i].close; break;
        }
        
        if (value < minValue) {
          minValue = value;
          minIndex = i;
        }
      }
      
      return minIndex;
    },
    
    // レート構造体の履歴データを配列にコピー
    CopyRates: (symbol: string, timeframe: number, start: number, count: number, dst: any[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        const c = arr[start + i];
        dst[i] = {
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          tick_volume: c.volume ?? 0,
          time: c.time,
        };
        copied++;
      }
      return copied;
    },
    
    // 時間データを配列にコピー
    CopyTime: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].time;
        copied++;
      }
      return copied;
    },
    
    // 始値データを配列にコピー
    CopyOpen: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].open;
        copied++;
      }
      return copied;
    },
    
    // 高値データを配列にコピー
    CopyHigh: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].high;
        copied++;
      }
      return copied;
    },
    
    // 安値データを配列にコピー
    CopyLow: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].low;
        copied++;
      }
      return copied;
    },
    
    // 終値データを配列にコピー
    CopyClose: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].close;
        copied++;
      }
      return copied;
    },
    
    // 出来高データを配列にコピー
    CopyTickVolume: (symbol: string, timeframe: number, start: number, count: number, dst: number[]) => {
      const arr = candlesFor(symbol, timeframe);
      let copied = 0;
      for (let i = 0; i < count && start + i < arr.length; i++) {
        dst[i] = arr[start + i].volume ?? 0;
        copied++;
      }
      return copied;
    },
    
    // データの更新
    RefreshRates: () => {
      // 簡易実装：データ更新をシミュレート
      return true;
    },
    
    // 履歴データの状態に関する情報を取得
    SeriesInfoInteger: (symbol: string, timeframe: number, propId: number, longVar?: number) => {
      const arr = candlesFor(symbol, timeframe);
      
      // プロパティIDに応じて値を返す
      switch (propId) {
        case 0: // SERIES_BARS_COUNT
          return arr.length;
        case 1: // SERIES_FIRSTDATE
          return arr.length > 0 ? arr[0].time : 0;
        case 2: // SERIES_LASTDATE
          return arr.length > 0 ? arr[arr.length - 1].time : 0;
        case 3: // SERIES_SYNCHRONIZED
          return 1; // 常に同期済みと仮定
        case 4: // SERIES_SERVER_FIRSTDATE
          return arr.length > 0 ? arr[0].time : 0;
        case 5: // SERIES_SERVER_LASTDATE
          return arr.length > 0 ? arr[arr.length - 1].time : 0;
        case 6: // SERIES_TERMINAL_FIRSTDATE
          return arr.length > 0 ? arr[0].time : 0;
        case 7: // SERIES_TERMINAL_LASTDATE
          return arr.length > 0 ? arr[arr.length - 1].time : 0;
        default:
          return 0;
      }
    },
  };
}
