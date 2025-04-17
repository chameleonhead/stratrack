import { useMemo } from "react";
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
import { Indicator } from "../dsl/indicator";

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
            source: { type: "source", name: "high", valueType: "array" },
            period: { type: "param", name: "period" },
          },
        },
        {
          name: "lowestLow",
          expression: {
            type: "aggregation",
            method: { type: "aggregationType", value: "min" },
            source: { type: "source", name: "low", valueType: "array" },
            period: { type: "param", name: "period" },
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
              left: { type: "variable", name: "highestHigh", valueType: "scalar" },
              right: { type: "variable", name: "lowestLow", valueType: "scalar" },
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
