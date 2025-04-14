import { useMemo } from "react";
import { Indicator } from "./types";
import {
  Accelerator,
  AccumulationDistribution,
  ADX,
  Alligator,
  AwesomeOscillator,
  ATR,
  BearsPower,
  BollingerBands,
  BullsPower,
  CommodityChannelIndex,
  DeMarker,
  Envelopes,
  ForceIndex,
  Fractals,
  GatorOscillator,
  Ichimoku,
  MarketFacilitationIndex,
  Momentum,
  MoneyFlowIndex,
  MA,
  MACDHistogram,
  MACD,
  OnBalanceVolume,
  RSI,
  RelativeVigorIndex,
  StandardDeviation,
  Stochastic,
  WilliamsPercentRange,
} from "./indicators";

const indicatorList: Indicator[] = [
  Accelerator,
  AccumulationDistribution,
  ADX,
  Alligator,
  AwesomeOscillator,
  ATR,
  BearsPower,
  BollingerBands,
  BullsPower,
  CommodityChannelIndex,
  DeMarker,
  Envelopes,
  ForceIndex,
  Fractals,
  GatorOscillator,
  Ichimoku,
  MarketFacilitationIndex,
  Momentum,
  MoneyFlowIndex,
  MA,
  MACDHistogram,
  MACD,
  OnBalanceVolume,
  RSI,
  RelativeVigorIndex,
  StandardDeviation,
  Stochastic,
  WilliamsPercentRange,
  {
    name: "donchian_channel",
    label: "ドンチャンチャネル",
    params: [{ type: "number", name: "period", label: "期間", required: true, default: 20 }],
    lines: [
      { name: "upper", label: "上限" },
      { name: "lower", label: "下限" },
      { name: "middle", label: "中央値" },
    ],
    defaultLineName: "middle",
    template: {
      variables: [
        {
          name: "highestHigh",
          expression: {
            type: "aggregation",
            method: { type: "aggregationType", value: "max" },
            source: { type: "source", name: "high" },
            period: { type: "variable", name: "period" },
          },
        },
        {
          name: "lowestLow",
          expression: {
            type: "aggregation",
            method: { type: "aggregationType", value: "min" },
            source: { type: "source", name: "low" },
            period: { type: "variable", name: "period" },
          },
        },
        {
          name: "middle",
          expression: {
            type: "binary_op",
            operator: "/",
            left: {
              type: "binary_op",
              operator: "+",
              left: { type: "variable", name: "highestHigh" },
              right: { type: "variable", name: "lowestLow" },
            },
            right: { type: "constant", value: 2 },
          },
        },
      ],
      exports: [
        { name: "upper", variableName: "highestHigh" },
        { name: "lower", variableName: "lowestLow" },
        { name: "middle", variableName: "middle" },
      ],
    },
  },
];

export const useIndicatorList = (): Indicator[] => {
  return useMemo(() => indicatorList, []);
};

export const useIndicatorByName = (name: string | undefined): Indicator | undefined => {
  return useMemo(() => indicatorList.find((ind) => ind.name === name), [name]);
};
