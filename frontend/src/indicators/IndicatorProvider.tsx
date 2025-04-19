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
import { Indicator } from "../codegen/dsl/indicator";

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
    params: [
      { type: "source", name: "high", label: "高値", required: true, default: "high" },
      { type: "source", name: "low", label: "安値", required: true, default: "low" },
      { type: "number", name: "period", label: "期間", required: true, default: 20 },
    ],
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
            source: { type: "source", name: "high", valueType: "bar" },
            period: { type: "param", name: "period", valueType: "scalar" },
            valueType: "scalar",
          },
          invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
        },
        {
          name: "lowestLow",
          expression: {
            type: "aggregation",
            method: { type: "aggregationType", value: "min" },
            source: { type: "source", name: "low", valueType: "bar" },
            period: { type: "param", name: "period", valueType: "scalar" },
            valueType: "scalar",
          },
          invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
        },
        {
          name: "middle",
          expression: {
            type: "binary_op",
            operator: "/",
            left: {
              type: "binary_op",
              operator: "+",
              left: {
                type: "bar_value",
                source: { type: "variable", name: "highestHigh", valueType: "bar" },
                valueType: "scalar",
              },
              right: {
                type: "bar_value",
                source: { type: "variable", name: "lowestLow", valueType: "bar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            right: { type: "constant", value: 2, valueType: "scalar" },
            valueType: "scalar",
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
