import { Indicator } from "./types";

export const Accelerator: Indicator = {
  name: "accelerator",
  label: "アクセラレーターオシレーター",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "number", name: "fastPeriod", label: "短期SMA期間", required: true, default: 5 },
    { type: "number", name: "slowPeriod", label: "長期SMA期間", required: true, default: 34 },
    { type: "number", name: "signalPeriod", label: "シグナルSMA期間", required: true, default: 5 },
  ],
  lines: [{ name: "ac", label: "AC" }],
  defaultLineName: "ac",
  template: {
    variables: [
      {
        name: "medianPrice",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "low" },
          },
          right: { type: "constant", value: 2 },
        },
      },
      {
        name: "fastSma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice" },
          period: { type: "param", name: "fastPeriod" },
        },
        invalidPeriod: { type: "param", name: "fastPeriod" },
      },
      {
        name: "slowSma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice" },
          period: { type: "param", name: "slowPeriod" },
        },
        invalidPeriod: { type: "param", name: "slowPeriod" },
      },
      {
        name: "ao",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "fastSma" },
          right: { type: "variable", name: "slowSma" },
        },
      },
      {
        name: "aoSma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "ao" },
          period: { type: "param", name: "signalPeriod" },
        },
        invalidPeriod: { type: "param", name: "signalPeriod" },
      },
      {
        name: "ac",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "ao" },
          right: { type: "variable", name: "aoSma" },
        },
      },
    ],
    exports: [{ name: "ac", variableName: "ac" }],
  },
};

export const AccumulationDistribution: Indicator = {
  name: "accumulation_distribution",
  label: "アキュムレーション/ディストリビューション (A/D)",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "close", label: "終値", required: true, default: "close" },
    { type: "source", name: "volume", label: "出来高", required: true, default: "volume" },
  ],
  lines: [{ name: "ad", label: "A/D" }],
  defaultLineName: "ad",
  template: {
    variables: [
      {
        name: "clv", // Close Location Value
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "-",
            left: {
              type: "binary_op",
              operator: "*",
              left: {
                type: "constant",
                value: 2,
              },
              right: { type: "source", name: "close" },
            },
            right: {
              type: "binary_op",
              operator: "+",
              left: { type: "source", name: "high" },
              right: { type: "source", name: "low" },
            },
          },
          right: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "low" },
          },
        },
      },
      {
        name: "mfv", // Money Flow Volume
        expression: {
          type: "binary_op",
          operator: "*",
          left: { type: "variable", name: "clv" },
          right: { type: "source", name: "volume" },
        },
      },
      {
        name: "ad",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "mfv" },
          period: { type: "constant", value: 0 }, // 全期間累積
        },
      },
    ],
    exports: [{ name: "ad", variableName: "ad" }],
  },
};

export const ADX: Indicator = {
  name: "adx",
  label: "平均方向性指数 (ADX)",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 14 },
  ],
  lines: [
    { name: "adx", label: "ADX" },
    { name: "pdi", label: "+DI" },
    { name: "mdi", label: "-DI" },
  ],
  defaultLineName: "adx",
  template: {
    variables: [
      {
        name: "upMove",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "source", name: "high" },
          right: { type: "source", name: "high", shiftBars: { type: "constant", value: 1 } },
        },
      },
      {
        name: "downMove",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "source", name: "low", shiftBars: { type: "constant", value: 1 } },
          right: { type: "source", name: "low" },
        },
      },
      {
        name: "plusDM",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: { type: "variable", name: "upMove" },
            right: { type: "variable", name: "downMove" },
          },
          trueExpr: {
            type: "ternary",
            condition: {
              type: "comparison",
              operator: ">",
              left: { type: "variable", name: "upMove" },
              right: { type: "constant", value: 0 },
            },
            trueExpr: { type: "variable", name: "upMove" },
            falseExpr: { type: "constant", value: 0 },
          },
          falseExpr: { type: "constant", value: 0 },
        },
      },
      {
        name: "minusDM",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: { type: "variable", name: "downMove" },
            right: { type: "variable", name: "upMove" },
          },
          trueExpr: {
            type: "ternary",
            condition: {
              type: "comparison",
              operator: ">",
              left: { type: "variable", name: "downMove" },
              right: { type: "constant", value: 0 },
            },
            trueExpr: { type: "variable", name: "downMove" },
            falseExpr: { type: "constant", value: 0 },
          },
          falseExpr: { type: "constant", value: 0 },
        },
      },
      {
        name: "tr1",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "source", name: "high" },
          right: { type: "source", name: "low" },
        },
      },
      {
        name: "tr2",
        expression: {
          type: "unary_op",
          operator: "abs",
          operand: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "source", shiftBars: { type: "constant", value: 1 } },
          },
        },
      },
      {
        name: "tr3",
        expression: {
          type: "unary_op",
          operator: "abs",
          operand: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "low" },
            right: { type: "source", name: "source", shiftBars: { type: "constant", value: 1 } },
          },
        },
      },
      {
        name: "tr",
        expression: {
          type: "binary_op",
          operator: "max",
          left: {
            type: "binary_op",
            operator: "max",
            left: { type: "variable", name: "tr1" },
            right: { type: "variable", name: "tr2" },
          },
          right: { type: "variable", name: "tr3" },
        },
      },
      {
        name: "smoothedPlusDM",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          source: { type: "variable", name: "plusDM" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "smoothedMinusDM",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          source: { type: "variable", name: "minusDM" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "smoothedTR",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          source: { type: "variable", name: "tr" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "pdi",
        expression: {
          type: "binary_op",
          operator: "*",
          left: {
            type: "binary_op",
            operator: "/",
            left: { type: "variable", name: "smoothedPlusDM" },
            right: { type: "variable", name: "smoothedTR" },
          },
          right: { type: "constant", value: 100 },
        },
      },
      {
        name: "mdi",
        expression: {
          type: "binary_op",
          operator: "*",
          left: {
            type: "binary_op",
            operator: "/",
            left: { type: "variable", name: "smoothedMinusDM" },
            right: { type: "variable", name: "smoothedTR" },
          },
          right: { type: "constant", value: 100 },
        },
      },
      {
        name: "dx",
        expression: {
          type: "binary_op",
          operator: "*",
          left: {
            type: "binary_op",
            operator: "/",
            left: {
              type: "unary_op",
              operator: "abs",
              operand: {
                type: "binary_op",
                operator: "-",
                left: { type: "variable", name: "pdi" },
                right: { type: "variable", name: "mdi" },
              },
            },
            right: {
              type: "binary_op",
              operator: "+",
              left: { type: "variable", name: "pdi" },
              right: { type: "variable", name: "mdi" },
            },
          },
          right: { type: "constant", value: 100 },
        },
      },
      {
        name: "adx",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          source: { type: "variable", name: "dx" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
    ],
    exports: [
      { name: "adx", variableName: "adx" },
      { name: "pdi", variableName: "pdi" },
      { name: "mdi", variableName: "mdi" },
    ],
  },
};

export const Alligator: Indicator = {
  name: "alligator",
  label: "アリゲーター",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "number", name: "jawPeriod", label: "ジョー期間", required: true, default: 13 },
    { type: "number", name: "jawShift", label: "ジョーシフト", required: true, default: 8 },
    { type: "number", name: "teethPeriod", label: "ティース期間", required: true, default: 8 },
    { type: "number", name: "teethShift", label: "ティースシフト", required: true, default: 5 },
    { type: "number", name: "lipsPeriod", label: "リップス期間", required: true, default: 5 },
    { type: "number", name: "lipsShift", label: "リップスシフト", required: true, default: 3 },
    {
      type: "aggregationType",
      name: "method",
      label: "種類 (sma, ema, smma, lwma)",
      required: true,
      default: "sma",
      selectableTypes: ["sma", "ema", "smma", "lwma"],
    },
  ],
  lines: [
    { name: "jaw", label: "ジョー" },
    { name: "teeth", label: "ティース" },
    { name: "lips", label: "リップス" },
  ],
  defaultLineName: "jaw",
  template: {
    variables: [
      {
        name: "medianPrice",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "low" },
          },
          right: { type: "constant", value: 2 },
        },
      },
      {
        name: "jaw",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice" },
          period: { type: "param", name: "jawPeriod" },
        },
        invalidPeriod: { type: "param", name: "jawPeriod" },
      },
      {
        name: "teeth",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice" },
          period: { type: "param", name: "teethPeriod" },
        },
        invalidPeriod: { type: "param", name: "teethPeriod" },
      },
      {
        name: "lips",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice" },
          period: { type: "param", name: "lipsPeriod" },
        },
        invalidPeriod: { type: "param", name: "lipsPeriod" },
      },
    ],
    exports: [
      { name: "jaw", variableName: "jaw" },
      { name: "teeth", variableName: "teeth" },
      { name: "lips", variableName: "lips" },
    ],
  },
};

export const AwesomeOscillator: Indicator = {
  name: "awesome_oscillator",
  label: "オーサムオシレーター (AO)",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "number", name: "fastPeriod", label: "短期期間", required: true, default: 5 },
    { type: "number", name: "slowPeriod", label: "長期期間", required: true, default: 34 },
  ],
  lines: [{ name: "ao", label: "AO" }],
  defaultLineName: "ao",
  template: {
    variables: [
      {
        name: "medianPrice",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "low" },
          },
          right: { type: "constant", value: 2 },
        },
      },
      {
        name: "smaFast",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice" },
          period: { type: "param", name: "fastPeriod" },
        },
        invalidPeriod: { type: "param", name: "fastPeriod" },
      },
      {
        name: "smaSlow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice" },
          period: { type: "param", name: "slowPeriod" },
        },
        invalidPeriod: { type: "param", name: "slowPeriod" },
      },
      {
        name: "ao",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "smaFast" },
          right: { type: "variable", name: "smaSlow" },
        },
      },
    ],
    exports: [{ name: "ao", variableName: "ao" }],
  },
};

export const ATR: Indicator = {
  name: "atr",
  label: "平均真の値幅 (ATR)",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 14 },
  ],
  lines: [{ name: "atr", label: "ATR" }],
  defaultLineName: "atr",
  template: {
    variables: [
      {
        name: "tr1",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "source", name: "high" },
          right: { type: "source", name: "low" },
        },
      },
      {
        name: "tr2",
        expression: {
          type: "unary_op",
          operator: "abs",
          operand: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "source", shiftBars: { type: "constant", value: 1 } },
          },
        },
      },
      {
        name: "tr3",
        expression: {
          type: "unary_op",
          operator: "abs",
          operand: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "low" },
            right: { type: "source", name: "source", shiftBars: { type: "constant", value: 1 } },
          },
        },
      },
      {
        name: "trueRange",
        expression: {
          type: "binary_op",
          operator: "max",
          left: {
            type: "binary_op",
            operator: "max",
            left: { type: "variable", name: "tr1" },
            right: { type: "variable", name: "tr2" },
          },
          right: { type: "variable", name: "tr3" },
        },
      },
      {
        name: "atr",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          source: { type: "variable", name: "trueRange" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
    ],
    exports: [{ name: "atr", variableName: "atr" }],
  },
};

export const BearsPower: Indicator = {
  name: "bears_power",
  label: "ベアーズパワー",
  params: [
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 13 },
  ],
  lines: [{ name: "bears", label: "Bears Power" }],
  defaultLineName: "bears",
  template: {
    variables: [
      {
        name: "ema",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "bears",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "source", name: "low" },
          right: { type: "variable", name: "ema" },
        },
      },
    ],
    exports: [{ name: "bears", variableName: "bears" }],
  },
};

export const BollingerBands: Indicator = {
  name: "bollinger_bands",
  label: "ボリンジャーバンド",
  params: [
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 20 },
    { type: "number", name: "deviation", label: "偏差", required: true, default: 2.0 },
  ],
  lines: [
    { name: "upper", label: "上バンド" },
    { name: "middle", label: "中央線" },
    { name: "lower", label: "下バンド" },
  ],
  defaultLineName: "middle",
  template: {
    variables: [
      {
        name: "middle",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "stddev",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "std" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "upper",
        expression: {
          type: "binary_op",
          operator: "+",
          left: { type: "variable", name: "middle" },
          right: {
            type: "binary_op",
            operator: "*",
            left: { type: "variable", name: "stddev" },
            right: { type: "param", name: "deviation" },
          },
        },
      },
      {
        name: "lower",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "middle" },
          right: {
            type: "binary_op",
            operator: "*",
            left: { type: "variable", name: "stddev" },
            right: { type: "variable", name: "deviation" },
          },
        },
      },
    ],
    exports: [
      { name: "upper", variableName: "upper" },
      { name: "middle", variableName: "middle" },
      { name: "lower", variableName: "lower" },
    ],
  },
};

export const BullsPower: Indicator = {
  name: "bulls_power",
  label: "ブルズパワー",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 13 },
  ],
  lines: [{ name: "bulls", label: "Bulls Power" }],
  defaultLineName: "bulls",
  template: {
    variables: [
      {
        name: "ema",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "bulls",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "source", name: "high" },
          right: { type: "variable", name: "ema" },
        },
      },
    ],
    exports: [{ name: "bulls", variableName: "bulls" }],
  },
};

export const CommodityChannelIndex: Indicator = {
  name: "commodity_channel_index",
  label: "CCI (商品チャネル指数)",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "close", label: "終値", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 14 },
  ],
  lines: [{ name: "cci", label: "CCI" }],
  defaultLineName: "cci",
  template: {
    variables: [
      {
        name: "tp", // Typical Price
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: {
              type: "binary_op",
              operator: "+",
              left: { type: "source", name: "high" },
              right: { type: "source", name: "low" },
            },
            right: { type: "source", name: "close" },
          },
          right: { type: "constant", value: 3 },
        },
      },
      {
        name: "smaTp",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "tp" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "dev",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "mean_absolute_deviation" },
          source: { type: "variable", name: "tp" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "cci",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "-",
            left: { type: "variable", name: "tp" },
            right: { type: "variable", name: "smaTp" },
          },
          right: {
            type: "binary_op",
            operator: "*",
            left: { type: "variable", name: "dev" },
            right: { type: "constant", value: 0.015 },
          },
        },
      },
    ],
    exports: [{ name: "cci", variableName: "cci" }],
  },
};

export const DeMarker: Indicator = {
  name: "demarker",
  label: "デマーカー",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "number", name: "period", label: "期間", required: true, default: 14 },
  ],
  lines: [{ name: "dem", label: "DeM" }],
  defaultLineName: "dem",
  template: {
    variables: [
      {
        name: "up",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "high", shiftBars: { type: "constant", value: 1 } },
          },
          trueExpr: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "high", shiftBars: { type: "constant", value: 1 } },
          },
          falseExpr: { type: "constant", value: 0 },
        },
      },
      {
        name: "down",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "<",
            left: { type: "source", name: "low" },
            right: { type: "source", name: "low", shiftBars: { type: "constant", value: 1 } },
          },
          trueExpr: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "low", shiftBars: { type: "constant", value: 1 } },
            right: { type: "source", name: "low" },
          },
          falseExpr: { type: "constant", value: 0 },
        },
      },
      {
        name: "sumUp",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "up" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "sumDown",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "down" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "dem",
        expression: {
          type: "binary_op",
          operator: "/",
          left: { type: "variable", name: "sumUp" },
          right: {
            type: "binary_op",
            operator: "+",
            left: { type: "variable", name: "sumUp" },
            right: { type: "variable", name: "sumDown" },
          },
        },
      },
    ],
    exports: [{ name: "dem", variableName: "dem" }],
  },
};

export const Envelopes: Indicator = {
  name: "envelopes",
  label: "エンベロープ",
  params: [
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 14 },
    {
      type: "aggregationType",
      name: "method",
      label: "種類 (sma, ema, smma, lwma)",
      required: true,
      default: "sma",
      selectableTypes: ["sma", "ema", "smma", "lwma"],
    },
    { type: "number", name: "deviation", label: "偏差（%）", required: true, default: 0.1 },
  ],
  lines: [
    { name: "upper", label: "上バンド" },
    { name: "basis", label: "基準線" },
    { name: "lower", label: "下バンド" },
  ],
  defaultLineName: "basis",
  template: {
    variables: [
      {
        name: "basis",
        expression: {
          type: "aggregation",
          method: { type: "param", name: "method" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "upper",
        expression: {
          type: "binary_op",
          operator: "*",
          left: { type: "variable", name: "basis" },
          right: {
            type: "binary_op",
            operator: "+",
            left: { type: "constant", value: 1 },
            right: {
              type: "binary_op",
              operator: "/",
              left: { type: "param", name: "deviation" },
              right: { type: "constant", value: 100 },
            },
          },
        },
      },
      {
        name: "lower",
        expression: {
          type: "binary_op",
          operator: "*",
          left: { type: "variable", name: "basis" },
          right: {
            type: "binary_op",
            operator: "-",
            left: { type: "constant", value: 1 },
            right: {
              type: "binary_op",
              operator: "/",
              left: { type: "variable", name: "deviation" },
              right: { type: "constant", value: 100 },
            },
          },
        },
      },
    ],
    exports: [
      { name: "upper", variableName: "upper" },
      { name: "basis", variableName: "basis" },
      { name: "lower", variableName: "lower" },
    ],
  },
};

export const ForceIndex: Indicator = {
  name: "force_index",
  label: "フォースインデックス",
  params: [
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 13 },
    {
      type: "aggregationType",
      name: "method",
      label: "種類 (sma, ema, smma, lwma)",
      required: true,
      default: "sma",
      selectableTypes: ["sma", "ema", "smma", "lwma"],
    },
  ],
  lines: [{ name: "force", label: "Force Index" }],
  defaultLineName: "force",
  template: {
    variables: [
      {
        name: "rawForce",
        expression: {
          type: "binary_op",
          operator: "*",
          left: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "close" },
            right: { type: "source", name: "source", shiftBars: { type: "constant", value: 1 } },
          },
          right: { type: "source", name: "volume" },
        },
      },
      {
        name: "force",
        expression: {
          type: "aggregation",
          method: { type: "param", name: "method" },
          source: { type: "variable", name: "rawForce" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
    ],
    exports: [{ name: "force", variableName: "force" }],
  },
};

export const Fractals: Indicator = {
  name: "fractals",
  label: "フラクタル",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "number", name: "leftBars", label: "左側の本数", required: true, default: 2 },
    { type: "number", name: "rightBars", label: "右側の本数", required: true, default: 2 },
  ],
  lines: [
    { name: "upFractal", label: "上フラクタル" },
    { name: "downFractal", label: "下フラクタル" },
  ],
  defaultLineName: "upFractal",
  template: {
    variables: [
      {
        name: "highMax",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "max" },
          source: { type: "source", name: "high" },
          period: { type: "constant", value: 5 },
        },
        invalidPeriod: { type: "constant", value: 5 },
      },
      {
        name: "lowMin",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low" },
          period: { type: "constant", value: 5 },
        },
        invalidPeriod: { type: "constant", value: 5 },
      },
      {
        name: "upFractal",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "==",
            left: { type: "source", name: "high" },
            right: { type: "variable", name: "highMax" },
          },
          trueExpr: { type: "source", name: "high" },
          falseExpr: { type: "constant", value: 0 },
        },
      },
      {
        name: "downFractal",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "==",
            left: { type: "source", name: "low" },
            right: { type: "variable", name: "lowMin" },
          },
          trueExpr: { type: "source", name: "low" },
          falseExpr: { type: "constant", value: 0 },
        },
      },
    ],
    exports: [
      { name: "upFractal", variableName: "upFractal" },
      { name: "downFractal", variableName: "downFractal" },
    ],
  },
};

export const GatorOscillator: Indicator = {
  name: "gator_oscillator",
  label: "ゲーターオシレーター",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "number", name: "jawPeriod", label: "ジョー期間", required: true, default: 13 },
    { type: "number", name: "teethPeriod", label: "ティース期間", required: true, default: 8 },
  ],
  lines: [
    { name: "gatorUpper", label: "ゲーター上部" },
    { name: "gatorLower", label: "ゲーター下部" },
  ],
  defaultLineName: "gatorUpper",
  template: {
    variables: [
      {
        name: "medianPrice",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "low" },
          },
          right: { type: "constant", value: 2 },
        },
      },
      {
        name: "jaw",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice" },
          period: { type: "param", name: "jawPeriod" },
        },
        invalidPeriod: { type: "param", name: "jawPeriod" },
      },
      {
        name: "teeth",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice" },
          period: { type: "param", name: "teethPeriod" },
        },
        invalidPeriod: { type: "param", name: "teethPeriod" },
      },
      {
        name: "gatorUpper",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "jaw" },
          right: { type: "variable", name: "teeth" },
        },
      },
      {
        name: "gatorLower",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "teeth" },
          right: { type: "variable", name: "jaw" },
        },
      },
    ],
    exports: [
      { name: "gatorUpper", variableName: "gatorUpper" },
      { name: "gatorLower", variableName: "gatorLower" },
    ],
  },
};

export const Ichimoku: Indicator = {
  name: "ichimoku",
  label: "一目均衡表",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "close", label: "終値", required: true, default: "close" },
    { type: "number", name: "tenkanPeriod", label: "転換線期間", required: true, default: 9 },
    { type: "number", name: "kijunPeriod", label: "基準線期間", required: true, default: 26 },
    { type: "number", name: "senkouPeriod", label: "先行スパン期間", required: true, default: 52 },
  ],
  lines: [
    { name: "tenkan", label: "転換線" },
    { name: "kijun", label: "基準線" },
    { name: "senkouA", label: "先行スパン1" },
    { name: "senkouB", label: "先行スパン2" },
    { name: "chikou", label: "遅行スパン" },
  ],
  defaultLineName: "kijun",
  template: {
    variables: [
      {
        name: "tenkanHigh",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "max" },
          source: { type: "source", name: "high" },
          period: { type: "param", name: "tenkanPeriod" },
        },
        invalidPeriod: { type: "param", name: "tenkanPeriod" },
      },
      {
        name: "tenkanLow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low" },
          period: { type: "param", name: "tenkanPeriod" },
        },
        invalidPeriod: { type: "param", name: "tenkanPeriod" },
      },
      {
        name: "tenkan",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: { type: "variable", name: "tenkanHigh" },
            right: { type: "variable", name: "tenkanLow" },
          },
          right: { type: "constant", value: 2 },
        },
      },
      {
        name: "kijunHigh",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "max" },
          source: { type: "source", name: "high" },
          period: { type: "param", name: "kijunPeriod" },
        },
      },
      {
        name: "kijunLow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low" },
          period: { type: "param", name: "kijunPeriod" },
        },
        invalidPeriod: { type: "param", name: "kijunPeriod" },
      },
      {
        name: "kijun",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: { type: "variable", name: "kijunHigh" },
            right: { type: "variable", name: "kijunLow" },
          },
          right: { type: "constant", value: 2 },
        },
      },
      {
        name: "senkouA",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: { type: "variable", name: "tenkan" },
            right: { type: "variable", name: "kijun" },
          },
          right: { type: "constant", value: 2 },
        },
      },
      {
        name: "senkouBHigh",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "max" },
          source: { type: "source", name: "high" },
          period: { type: "param", name: "senkouPeriod" },
        },
        invalidPeriod: { type: "param", name: "senkouPeriod" },
      },
      {
        name: "senkouBLow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low" },
          period: { type: "param", name: "senkouPeriod" },
        },
        invalidPeriod: { type: "param", name: "senkouPeriod" },
      },
      {
        name: "senkouB",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: { type: "variable", name: "senkouBHigh" },
            right: { type: "variable", name: "senkouBLow" },
          },
          right: { type: "constant", value: 2 },
        },
      },
      {
        name: "chikou",
        expression: {
          type: "source",
          name: "close",
          shiftBars: { type: "param", name: "kijunPeriod" },
        },
      },
    ],
    exports: [
      { name: "tenkan", variableName: "tenkan" },
      { name: "kijun", variableName: "kijun" },
      { name: "senkouA", variableName: "senkouA" },
      { name: "senkouB", variableName: "senkouB" },
      { name: "chikou", variableName: "chikou" },
    ],
  },
};

export const MarketFacilitationIndex: Indicator = {
  name: "market_facilitation_index",
  label: "マーケットファシリテーションインデックス (MFI)",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "volume", label: "出来高", required: true, default: "volume" },
  ],
  lines: [{ name: "mfi", label: "MFI" }],
  defaultLineName: "mfi",
  template: {
    variables: [
      {
        name: "mfi",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "low" },
          },
          right: {
            type: "source",
            name: "volume",
          },
        },
      },
    ],
    exports: [{ name: "mfi", variableName: "mfi" }],
  },
};

export const Momentum: Indicator = {
  name: "momentum",
  label: "モメンタム",
  params: [
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 10 },
  ],
  lines: [{ name: "momentum", label: "Momentum" }],
  defaultLineName: "momentum",
  template: {
    variables: [
      {
        name: "momentum",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "source", name: "source" },
          right: { type: "source", name: "source", shiftBars: { type: "param", name: "period" } },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
    ],
    exports: [{ name: "momentum", variableName: "momentum" }],
  },
};

export const MoneyFlowIndex: Indicator = {
  name: "money_flow_index",
  label: "マネーフローインデックス (MFI)",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "close", label: "終値", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 14 },
  ],
  lines: [{ name: "mfi", label: "MFI" }],
  defaultLineName: "mfi",
  template: {
    variables: [
      {
        name: "tp", // Typical Price
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: {
              type: "binary_op",
              operator: "+",
              left: { type: "source", name: "high" },
              right: { type: "source", name: "low" },
            },
            right: { type: "source", name: "close" },
          },
          right: { type: "constant", value: 3 },
        },
      },
      {
        name: "rawMoneyFlow",
        expression: {
          type: "binary_op",
          operator: "*",
          left: { type: "variable", name: "tp" },
          right: { type: "source", name: "close" }, // 通常は volume を使うが close で代用
        },
      },
      {
        name: "positiveFlow",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: { type: "variable", name: "tp" },
            right: { type: "variable", name: "tp", shiftBars: { type: "constant", value: 1 } },
          },
          trueExpr: { type: "variable", name: "rawMoneyFlow" },
          falseExpr: { type: "constant", value: 0 },
        },
      },
      {
        name: "negativeFlow",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "<",
            left: { type: "variable", name: "tp" },
            right: { type: "variable", name: "tp", shiftBars: { type: "constant", value: 1 } },
          },
          trueExpr: { type: "variable", name: "rawMoneyFlow" },
          falseExpr: { type: "constant", value: 0 },
        },
      },
      {
        name: "sumPositive",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "positiveFlow" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "sumNegative",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "negativeFlow" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "moneyRatio",
        expression: {
          type: "binary_op",
          operator: "/",
          left: { type: "variable", name: "sumPositive" },
          right: { type: "variable", name: "sumNegative" },
        },
      },
      {
        name: "mfi",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "constant", value: 100 },
          right: {
            type: "binary_op",
            operator: "/",
            left: { type: "constant", value: 100 },
            right: {
              type: "binary_op",
              operator: "+",
              left: { type: "constant", value: 1 },
              right: { type: "variable", name: "moneyRatio" },
            },
          },
        },
      },
    ],
    exports: [{ name: "mfi", variableName: "mfi" }],
  },
};

export const MA: Indicator = {
  name: "moving_average",
  label: "移動平均",
  params: [
    {
      type: "aggregationType",
      name: "method",
      label: "種類 (sma, ema, smma, lwma)",
      required: true,
      default: "sma",
      selectableTypes: ["sma", "ema", "smma", "lwma"],
    },
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 14 },
  ],
  lines: [{ name: "ma", label: "移動平均" }],
  defaultLineName: "ma",
  template: {
    variables: [
      {
        name: "ma",
        expression: {
          type: "aggregation",
          method: { type: "param", name: "method" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
    ],
    exports: [{ name: "ma", variableName: "ma" }],
  },
};

export const MACDHistogram: Indicator = {
  name: "macd_histogram",
  label: "MACDヒストグラム",
  params: [
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "fastPeriod", label: "短期EMA期間", required: true, default: 12 },
    { type: "number", name: "slowPeriod", label: "長期EMA期間", required: true, default: 26 },
    { type: "number", name: "signalPeriod", label: "シグナルSMA期間", required: true, default: 9 },
  ],
  lines: [
    { name: "macd", label: "MACD" },
    { name: "signal", label: "シグナル" },
    { name: "histogram", label: "ヒストグラム" },
  ],
  defaultLineName: "histogram",
  template: {
    variables: [
      {
        name: "fastEma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "fastPeriod" },
        },
        invalidPeriod: { type: "param", name: "fastPeriod" },
      },
      {
        name: "slowEma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "slowPeriod" },
        },
        invalidPeriod: { type: "param", name: "slowPeriod" },
      },
      {
        name: "macd",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "fastEma" },
          right: { type: "variable", name: "slowEma" },
        },
      },
      {
        name: "signal",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "macd" },
          period: { type: "param", name: "signalPeriod" },
        },
        invalidPeriod: { type: "param", name: "signalPeriod" },
      },
      {
        name: "histogram",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "macd" },
          right: { type: "variable", name: "signal" },
        },
      },
    ],
    exports: [
      { name: "macd", variableName: "macd" },
      { name: "signal", variableName: "signal" },
      { name: "histogram", variableName: "histogram" },
    ],
  },
};

export const MACD: Indicator = {
  name: "macd",
  label: "MACD",
  params: [
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "fastPeriod", label: "短期期間", required: true, default: 12 },
    { type: "number", name: "slowPeriod", label: "長期期間", required: true, default: 26 },
    { type: "number", name: "signalPeriod", label: "シグナル期間", required: true, default: 9 },
  ],
  lines: [
    { name: "macd", label: "MACD" },
    { name: "signal", label: "シグナル" },
    { name: "histogram", label: "ヒストグラム" },
  ],
  defaultLineName: "macd",
  template: {
    variables: [
      {
        name: "emaFast",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "fastPeriod" },
        },
        invalidPeriod: { type: "param", name: "fastPeriod" },
      },
      {
        name: "emaSlow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "slowPeriod" },
        },
        invalidPeriod: { type: "param", name: "slowPeriod" },
      },
      {
        name: "macd",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "emaFast" },
          right: { type: "variable", name: "emaSlow" },
        },
      },
      {
        name: "signal",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "variable", name: "macd" },
          period: { type: "param", name: "signalPeriod" },
        },
        invalidPeriod: { type: "param", name: "signalPeriod" },
      },
      {
        name: "histogram",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "variable", name: "macd" },
          right: { type: "variable", name: "signal" },
        },
      },
    ],
    exports: [
      { name: "macd", variableName: "macd" },
      { name: "signal", variableName: "signal" },
      { name: "histogram", variableName: "histogram" },
    ],
  },
};

export const OnBalanceVolume: Indicator = {
  name: "on_balance_volume",
  label: "オンバランスボリューム (OBV)",
  params: [{ type: "source", name: "source", label: "参照価格", required: true, default: "close" }],
  lines: [{ name: "obv", label: "OBV" }],
  defaultLineName: "obv",
  template: {
    variables: [
      {
        name: "change",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "source", name: "source" },
          right: { type: "source", name: "source", shiftBars: { type: "constant", value: 1 } },
        },
      },
      {
        name: "directionalVolume",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: { type: "variable", name: "change" },
            right: { type: "constant", value: 0 },
          },
          trueExpr: { type: "source", name: "volume" },
          falseExpr: {
            type: "ternary",
            condition: {
              type: "comparison",
              operator: "<",
              left: { type: "variable", name: "change" },
              right: { type: "constant", value: 0 },
            },
            trueExpr: {
              type: "unary_op",
              operator: "-",
              operand: { type: "source", name: "volume" },
            },
            falseExpr: { type: "constant", value: 0 },
          },
        },
      },
      {
        name: "obv",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "directionalVolume" },
          period: { type: "constant", value: 0 }, // 全期間累積
        },
      },
    ],
    exports: [{ name: "obv", variableName: "obv" }],
  },
};

export const RSI: Indicator = {
  name: "rsi",
  label: "相対力指数 (RSI)",
  params: [
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 14 },
  ],
  lines: [{ name: "rsi", label: "RSI" }],
  defaultLineName: "rsi",
  template: {
    variables: [
      {
        name: "delta",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "source", name: "source" },
          right: { type: "source", name: "source", shiftBars: { type: "constant", value: 1 } },
        },
      },
      {
        name: "gain",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: { type: "variable", name: "delta" },
            right: { type: "constant", value: 0 },
          },
          trueExpr: { type: "variable", name: "delta" },
          falseExpr: { type: "constant", value: 0 },
        },
      },
      {
        name: "loss",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "<",
            left: { type: "variable", name: "delta" },
            right: { type: "constant", value: 0 },
          },
          trueExpr: {
            type: "unary_op",
            operator: "abs",
            operand: { type: "variable", name: "delta" },
          },
          falseExpr: { type: "constant", value: 0 },
        },
      },
      {
        name: "avgGain",
        expression: {
          type: "binary_op",
          left: {
            type: "binary_op",
            left: {
              type: "binary_op",
              left: {
                type: "variable",
                name: "avgGain",
                shiftBars: { type: "constant", value: 1 },
              },
              operator: "*",
              right: {
                type: "binary_op",
                left: { type: "param", name: "period" },
                operator: "-",
                right: { type: "constant", value: 1 },
              },
            },
            operator: "+",
            right: { type: "variable", name: "gain" },
          },
          operator: "/",
          right: { type: "param", name: "period" },
        },
        invalidPeriod: {
          type: "binary_op",
          left: { type: "param", name: "period" },
          operator: "+",
          right: { type: "constant", value: 1 },
        },
        fallback: {
          expression: {
            type: "aggregation",
            method: { type: "aggregationType", value: "sma" },
            source: { type: "variable", name: "gain" },
            period: { type: "param", name: "period" },
          },
          invalidPeriod: { type: "param", name: "period" },
        },
      },
      {
        name: "avgLoss",
        expression: {
          type: "binary_op",
          left: {
            type: "binary_op",
            left: {
              type: "binary_op",
              left: {
                type: "variable",
                name: "avgLoss",
                shiftBars: { type: "constant", value: 1 },
              },
              operator: "*",
              right: {
                type: "binary_op",
                left: { type: "param", name: "period" },
                operator: "-",
                right: { type: "constant", value: 1 },
              },
            },
            operator: "+",
            right: { type: "variable", name: "loss" },
          },
          operator: "/",
          right: { type: "param", name: "period" },
        },
        invalidPeriod: {
          type: "binary_op",
          left: { type: "param", name: "period" },
          operator: "+",
          right: { type: "constant", value: 1 },
        },
        fallback: {
          expression: {
            type: "aggregation",
            method: { type: "aggregationType", value: "sma" },
            source: { type: "variable", name: "loss" },
            period: { type: "param", name: "period" },
          },
          invalidPeriod: { type: "param", name: "period" },
        },
      },
      {
        name: "rsi",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            left: { type: "variable", name: "avgLoss" },
            operator: "!=",
            right: { type: "constant", value: 0 },
          },
          trueExpr: {
            type: "binary_op",
            left: { type: "constant", value: 100 },
            operator: "-",
            right: {
              type: "binary_op",
              left: { type: "constant", value: 100 },
              operator: "/",
              right: {
                type: "binary_op",
                left: { type: "constant", value: 1 },
                operator: "+",
                right: {
                  type: "binary_op",
                  left: { type: "variable", name: "avgGain" },
                  operator: "/",
                  right: { type: "variable", name: "avgLoss" },
                },
              },
            },
          },
          falseExpr: {
            type: "ternary",
            condition: {
              type: "comparison",
              left: { type: "variable", name: "avgGain" },
              operator: "!=",
              right: { type: "constant", value: 0 },
            },
            trueExpr: { type: "constant", value: 100 },
            falseExpr: { type: "constant", value: 50 },
          },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
    ],
    exports: [{ name: "rsi", variableName: "rsi" }],
  },
};

export const RelativeVigorIndex: Indicator = {
  name: "relative_vigor_index",
  label: "相対活力指数 (RVI)",
  params: [
    { type: "source", name: "open", label: "始値", required: true, default: "open" },
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "close", label: "終値", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 10 },
  ],
  lines: [
    { name: "rvi", label: "RVI" },
    { name: "signal", label: "シグナル" },
  ],
  defaultLineName: "rvi",
  template: {
    variables: [
      {
        name: "num",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "close" },
            right: { type: "source", name: "open" },
          },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "den",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "high" },
            right: { type: "source", name: "low" },
          },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "rvi",
        expression: {
          type: "binary_op",
          operator: "/",
          left: { type: "variable", name: "num" },
          right: { type: "variable", name: "den" },
        },
      },
      {
        name: "signal",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "rvi" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
    ],
    exports: [{ name: "rvi", variableName: "rvi" }],
  },
};

export const StandardDeviation: Indicator = {
  name: "standard_deviation",
  label: "標準偏差",
  params: [
    { type: "source", name: "source", label: "参照価格", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 20 },
  ],
  lines: [{ name: "stddev", label: "標準偏差" }],
  defaultLineName: "stddev",
  template: {
    variables: [
      {
        name: "stddev",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "std" },
          source: { type: "source", name: "source" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
    ],
    exports: [{ name: "stddev", variableName: "stddev" }],
  },
};

export const Stochastic: Indicator = {
  name: "stochastic",
  label: "ストキャスティクス",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "close", label: "終値", required: true, default: "close" },
    { type: "number", name: "kPeriod", label: "%K期間", required: true, default: 14 },
    { type: "number", name: "dPeriod", label: "%D期間", required: true, default: 3 },
    { type: "number", name: "slowing", label: "スローイング", required: true, default: 3 },
  ],
  lines: [
    { name: "k", label: "%K" },
    { name: "d", label: "%D" },
  ],
  defaultLineName: "k",
  template: {
    variables: [
      {
        name: "lowestLow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low" },
          period: { type: "param", name: "kPeriod" },
        },
        invalidPeriod: { type: "param", name: "kPeriod" },
      },
      {
        name: "highestHigh",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "max" },
          source: { type: "source", name: "high" },
          period: { type: "param", name: "kPeriod" },
        },
        invalidPeriod: { type: "param", name: "kPeriod" },
      },
      {
        name: "rawK",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "-",
            left: { type: "source", name: "close" },
            right: { type: "variable", name: "lowestLow" },
          },
          right: {
            type: "binary_op",
            operator: "-",
            left: { type: "variable", name: "highestHigh" },
            right: { type: "variable", name: "lowestLow" },
          },
        },
      },
      {
        name: "k",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "rawK" },
          period: { type: "param", name: "slowing" },
        },
        invalidPeriod: { type: "param", name: "slowing" },
      },
      {
        name: "d",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "k" },
          period: { type: "param", name: "dPeriod" },
        },
        invalidPeriod: { type: "param", name: "dPeriod" },
      },
    ],
    exports: [
      { name: "k", variableName: "k" },
      { name: "d", variableName: "d" },
    ],
  },
};

export const WilliamsPercentRange: Indicator = {
  name: "williams_percent_range",
  label: "ウィリアムズ％R",
  params: [
    { type: "source", name: "high", label: "高値", required: true, default: "high" },
    { type: "source", name: "low", label: "安値", required: true, default: "low" },
    { type: "source", name: "close", label: "終値", required: true, default: "close" },
    { type: "number", name: "period", label: "期間", required: true, default: 14 },
  ],
  lines: [{ name: "percentR", label: "%R" }],
  defaultLineName: "percentR",
  template: {
    variables: [
      {
        name: "highestHigh",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "max" },
          source: { type: "source", name: "high" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "lowestLow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low" },
          period: { type: "param", name: "period" },
        },
        invalidPeriod: { type: "param", name: "period" },
      },
      {
        name: "percentR",
        expression: {
          type: "binary_op",
          operator: "*",
          left: {
            type: "binary_op",
            operator: "/",
            left: {
              type: "binary_op",
              operator: "-",
              left: { type: "variable", name: "highestHigh" },
              right: { type: "source", name: "close" },
            },
            right: {
              type: "binary_op",
              operator: "-",
              left: { type: "variable", name: "highestHigh" },
              right: { type: "variable", name: "lowestLow" },
            },
          },
          right: { type: "constant", value: -100 },
        },
      },
    ],
    exports: [{ name: "percentR", variableName: "percentR" }],
  },
};
