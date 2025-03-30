import { useMemo } from "react";

export type IndicatorDefinition = {
  name: string;
  label: string;
  params: Array<{
    key: string;
    label: string;
    type: "number" | "string" | "boolean";
    default?: number | string | boolean;
  }>;
  validateParams(newParams: {
    [x: string]: string | number | boolean | null;
  }): [true, undefined] | [false, Record<string, string | undefined>];
  sourceRequired?: boolean; // e.g. close, open, high, low
};

const indicatorList: IndicatorDefinition[] = [
  {
    name: "SMA",
    label: "単純移動平均 (SMA)",
    params: [{ key: "period", label: "期間", type: "number", default: 14 }],
    validateParams: (newParams) => {
      const period = newParams["period"];
      if (typeof period !== "number" || period <= 0) {
        return [false, { period: "期間は正の整数である必要があります。" }];
      }
      return [true, undefined];
    },
    sourceRequired: true,
  },
  {
    name: "EMA",
    label: "指数移動平均 (EMA)",
    params: [{ key: "period", label: "期間", type: "number", default: 14 }],
    validateParams: (newParams) => {
      const period = newParams["period"];
      if (typeof period !== "number" || period <= 0) {
        return [false, { period: "期間は正の整数である必要があります。" }];
      }
      return [true, undefined];
    },
    sourceRequired: true,
  },
  {
    name: "RSI",
    label: "相対力指数 (RSI)",
    params: [{ key: "period", label: "期間", type: "number", default: 14 }],
    validateParams: (newParams) => {
      const period = newParams["period"];
      if (typeof period !== "number" || period <= 0) {
        return [false, { period: "期間は正の整数である必要があります。" }];
      }
      return [true, undefined];
    },
    sourceRequired: true,
  },
  {
    name: "Donchian",
    label: "ドンチャンチャネル",
    params: [{ key: "period", label: "期間", type: "number", default: 20 }],
    validateParams: (newParams) => {
      const period = newParams["period"];
      if (typeof period !== "number" || period <= 0) {
        return [false, { period: "期間は正の整数である必要があります。" }];
      }
      return [true, undefined];
    },
    sourceRequired: false,
  },
];

export const useIndicatorList = (): IndicatorDefinition[] => {
  return useMemo(() => indicatorList, []);
};

export const useIndicatorByName = (
  name: string | undefined
): IndicatorDefinition | undefined => {
  return useMemo(() => indicatorList.find((ind) => ind.name === name), [name]);
};
