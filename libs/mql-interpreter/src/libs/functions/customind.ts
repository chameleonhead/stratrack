import type { ExecutionContext } from "../domain/types";
import type { BuiltinFunction } from "./types";

export function createCustomInd(context: ExecutionContext): Record<string, BuiltinFunction> {
  // 初期化（初回呼び出し時）
  if (context.hideTestIndicators === undefined) context.hideTestIndicators = false;
  if (context.indicatorBuffers === undefined) context.indicatorBuffers = [];
  if (context.indicatorCounted === undefined) context.indicatorCounted = 0;
  if (context.indicatorDigits === undefined) context.indicatorDigits = 5;
  if (context.indicatorShortName === undefined) context.indicatorShortName = "";
  if (context.indexArrows === undefined) context.indexArrows = {};
  if (context.indexDrawBegins === undefined) context.indexDrawBegins = {};
  if (context.indexEmptyValues === undefined) context.indexEmptyValues = {};
  if (context.indexLabels === undefined) context.indexLabels = {};
  if (context.indexShifts === undefined) context.indexShifts = {};
  if (context.indexStyles === undefined) context.indexStyles = {};
  if (context.levelStyles === undefined) context.levelStyles = {};
  if (context.levelValues === undefined) context.levelValues = {};

  return {
    // テストインジケーターの表示/非表示を制御
    HideTestIndicators: (hide: boolean = true) => {
      context.hideTestIndicators = hide;
      return;
    },

    // インジケーターバッファーのメモリ割り当て
    IndicatorBuffers: (count: number) => {
      context.indicatorBuffers = new Array(count).fill(null).map(() => []);
      return;
    },

    // 最後に起動されてから変更されていないバーの数を返す
    IndicatorCounted: () => {
      return context.indicatorCounted;
    },

    // インジケーター値の表示精度を設定
    IndicatorDigits: (digits: number) => {
      context.indicatorDigits = digits;
      return;
    },

    // インジケーターの倍精度プロパティを設定
    IndicatorSetDouble: (prop: number, value: number) => {
      // プロパティIDに応じて値を設定
      switch (prop) {
        case 0: // INDICATOR_LEVELVALUE
          // レベル値の設定は SetLevelValue で行う
          break;
        default:
          // その他のプロパティは無視
          break;
      }
      return;
    },

    // インジケーターの整数プロパティを設定
    IndicatorSetInteger: (prop: number, value: number) => {
      // プロパティIDに応じて値を設定
      switch (prop) {
        case 0: // INDICATOR_DIGITS
          context.indicatorDigits = value;
          break;
        case 1: // INDICATOR_LEVELS
          // レベル数の設定
          break;
        default:
          // その他のプロパティは無視
          break;
      }
      return;
    },

    // インジケーターの文字列プロパティを設定
    IndicatorSetString: (prop: number, value: string) => {
      // プロパティIDに応じて値を設定
      switch (prop) {
        case 0: // INDICATOR_SHORTNAME
          context.indicatorShortName = value;
          break;
        default:
          // その他のプロパティは無視
          break;
      }
      return;
    },

    // インジケーターの短縮名を設定
    IndicatorShortName: (name: string) => {
      context.indicatorShortName = name;
      return;
    },

    // インジケーターラインの矢印シンボルを設定
    SetIndexArrow: (index: number, arrow: number) => {
      context.indexArrows![index] = arrow;
      return;
    },

    // インジケーターバッファーを配列にバインド
    SetIndexBuffer: (index: number, buffer: number[]) => {
      if (index >= 0 && index < context.indicatorBuffers!.length) {
        context.indicatorBuffers![index] = buffer;
      }
      return;
    },

    // インジケーターラインの描画開始バーを設定
    SetIndexDrawBegin: (index: number, begin: number) => {
      context.indexDrawBegins![index] = begin;
      return;
    },

    // インジケーターラインの空値を設定
    SetIndexEmptyValue: (index: number, value: number) => {
      context.indexEmptyValues![index] = value;
      return;
    },

    // インジケーターラインのラベルを設定
    SetIndexLabel: (index: number, label: string) => {
      context.indexLabels![index] = label;
      return;
    },

    // インジケーターラインのオフセットを設定
    SetIndexShift: (index: number, shift: number) => {
      context.indexShifts![index] = shift;
      return;
    },

    // インジケーターラインのスタイル、幅、色を設定
    SetIndexStyle: (index: number, style: number, width: number = 1, color: number = 0) => {
      context.indexStyles![index] = { style, width, color };
      return;
    },

    // インジケーターレベルのスタイル、幅、色を設定
    SetLevelStyle: (level: number, style: number, width: number = 1, color: number = 0) => {
      context.levelStyles![level] = { style, width, color };
      return;
    },

    // インジケーターレベルの値を設定
    SetLevelValue: (level: number, value: number) => {
      context.levelValues![level] = value;
      return;
    },

    // 内部状態を取得するためのヘルパー関数（テスト用）
    _getInternalState: () => ({
      hideTestIndicators: context.hideTestIndicators,
      indicatorBuffers: context.indicatorBuffers,
      indicatorCounted: context.indicatorCounted,
      indicatorDigits: context.indicatorDigits,
      indicatorShortName: context.indicatorShortName,
      indexArrows: context.indexArrows,
      indexDrawBegins: context.indexDrawBegins,
      indexEmptyValues: context.indexEmptyValues,
      indexLabels: context.indexLabels,
      indexShifts: context.indexShifts,
      indexStyles: context.indexStyles,
      levelStyles: context.levelStyles,
      levelValues: context.levelValues,
    }),

    // 内部状態を設定するためのヘルパー関数（テスト用）
    _setInternalState: (state: any) => {
      context.hideTestIndicators = state.hideTestIndicators ?? false;
      context.indicatorBuffers = state.indicatorBuffers ?? [];
      context.indicatorCounted = state.indicatorCounted ?? 0;
      context.indicatorDigits = state.indicatorDigits ?? 5;
      context.indicatorShortName = state.indicatorShortName ?? "";
      context.indexArrows = state.indexArrows ?? {};
      context.indexDrawBegins = state.indexDrawBegins ?? {};
      context.indexEmptyValues = state.indexEmptyValues ?? {};
      context.indexLabels = state.indexLabels ?? {};
      context.indexShifts = state.indexShifts ?? {};
      context.indexStyles = state.indexStyles ?? {};
      context.levelStyles = state.levelStyles ?? {};
      context.levelValues = state.levelValues ?? {};
    },
  };
}
