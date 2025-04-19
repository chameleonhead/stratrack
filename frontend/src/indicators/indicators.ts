import { Indicator } from "../codegen/dsl/indicator";

export const Accelerator: Indicator = {
  name: "accelerator",
  label: "アクセラレーターオシレーター",
  params: [
    {
      type: "source",
      name: "median",
      label: "中間価格（高 + 低）÷ 2",
      required: true,
      default: "median",
    },
    { type: "number", name: "fastPeriod", label: "短期SMA期間", required: true, default: 5 },
    { type: "number", name: "slowPeriod", label: "長期SMA期間", required: true, default: 34 },
    { type: "number", name: "signalPeriod", label: "シグナルSMA期間", required: true, default: 5 },
  ],
  lines: [{ name: "ac", label: "AC" }],
  defaultLineName: "ac",
  template: {
    variables: [
      {
        name: "fastSma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "source", name: "median", valueType: "bar" },
          period: { type: "param", name: "fastPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "fastPeriod", valueType: "scalar" },
      },
      {
        name: "slowSma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "source", name: "median", valueType: "bar" },
          period: { type: "param", name: "slowPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "slowPeriod", valueType: "scalar" },
      },
      {
        name: "ao",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "fastSma", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "slowSma", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "aoSma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "ao", valueType: "bar" },
          period: { type: "param", name: "signalPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "signalPeriod", valueType: "scalar" },
      },
      {
        name: "ac",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "ao", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "aoSma", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
    {
      type: "source",
      name: "tick_volume",
      label: "Tick出来高",
      required: true,
      default: "tick_volume",
    },
  ],
  lines: [{ name: "ad", label: "A/D" }],
  defaultLineName: "ad",
  template: {
    variables: [
      {
        name: "diff",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "source", name: "high", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "source", name: "low", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "clv",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "binary_op",
            operator: "*",
            left: { type: "constant", value: 2, valueType: "scalar" },
            right: {
              type: "bar_value",
              source: { type: "source", name: "close", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: {
            type: "binary_op",
            operator: "+",
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "mfv",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "diff", valueType: "bar" },
              valueType: "scalar",
            },
            operator: "<",
            right: { type: "constant", value: 0.000000001, valueType: "scalar" },
          },
          trueExpr: {
            type: "constant",
            value: 0,
            valueType: "scalar",
          },
          falseExpr: {
            type: "ternary",
            condition: {
              type: "comparison",
              operator: "==",
              left: {
                type: "bar_value",
                source: { type: "variable", name: "clv", valueType: "bar" },
                valueType: "scalar",
              },
              right: { type: "constant", value: 0, valueType: "scalar" },
            },
            trueExpr: {
              type: "constant",
              value: 0,
              valueType: "scalar",
            },
            falseExpr: {
              type: "binary_op",
              operator: "*",
              left: {
                type: "binary_op",
                operator: "/",
                left: {
                  type: "bar_value",
                  source: { type: "variable", name: "clv", valueType: "bar" },
                  valueType: "scalar",
                },
                right: {
                  type: "bar_value",
                  source: { type: "variable", name: "diff", valueType: "bar" },
                  valueType: "scalar",
                },
                valueType: "scalar",
              },
              right: {
                type: "bar_value",
                source: { type: "source", name: "tick_volume", valueType: "bar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "ad",
        expression: {
          type: "binary_op",
          left: {
            type: "bar_value",
            source: {
              type: "variable",
              name: "ad",
              valueType: "bar",
            },
            shiftBars: { type: "constant", value: 1, valueType: "scalar" },
            valueType: "scalar",
          },
          operator: "+",
          right: {
            type: "bar_value",
            source: { type: "variable", name: "mfv", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
        invalidPeriod: { type: "constant", value: 1, valueType: "scalar" },
        fallback: {
          expression: {
            type: "bar_value",
            source: { type: "variable", name: "mfv", valueType: "bar" },
            valueType: "scalar",
          },
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
          left: {
            type: "bar_value",
            source: { type: "source", name: "high", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: {
              type: "source",
              name: "high",
              valueType: "bar",
            },
            shiftBars: { type: "constant", value: 1, valueType: "scalar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "downMove",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: {
              type: "source",
              name: "low",
              valueType: "bar",
            },
            shiftBars: { type: "constant", value: 1, valueType: "scalar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "source", name: "low", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "plusDM",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "upMove", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "downMove", valueType: "bar" },
              valueType: "scalar",
            },
          },
          trueExpr: {
            type: "ternary",
            condition: {
              type: "comparison",
              operator: ">",
              left: {
                type: "bar_value",
                source: { type: "variable", name: "upMove", valueType: "bar" },
                valueType: "scalar",
              },
              right: { type: "constant", value: 0, valueType: "scalar" },
            },
            trueExpr: {
              type: "bar_value",
              source: { type: "variable", name: "upMove", valueType: "bar" },
              valueType: "scalar",
            },
            falseExpr: { type: "constant", value: 0, valueType: "scalar" },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "minusDM",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "downMove", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "upMove", valueType: "bar" },
              valueType: "scalar",
            },
          },
          trueExpr: {
            type: "ternary",
            condition: {
              type: "comparison",
              operator: ">",
              left: {
                type: "bar_value",
                source: { type: "variable", name: "downMove", valueType: "bar" },
                valueType: "scalar",
              },
              right: { type: "constant", value: 0, valueType: "scalar" },
            },
            trueExpr: {
              type: "bar_value",
              source: { type: "variable", name: "downMove", valueType: "bar" },
              valueType: "scalar",
            },
            falseExpr: { type: "constant", value: 0, valueType: "scalar" },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "tr1",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "source", name: "high", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "source", name: "low", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "source",
                name: "source",
                valueType: "bar",
              },
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "source",
                name: "source",
                valueType: "bar",
              },
              valueType: "scalar",
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
            },
            valueType: "scalar",
          },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "variable", name: "tr1", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "tr2", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "tr3", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "smoothedPlusDM",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          source: { type: "variable", name: "plusDM", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "smoothedMinusDM",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          source: { type: "variable", name: "minusDM", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "smoothedTR",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          period: { type: "param", name: "period", valueType: "scalar" },
          source: { type: "variable", name: "tr", valueType: "bar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "pdi",
        expression: {
          type: "binary_op",
          operator: "*",
          left: {
            type: "binary_op",
            operator: "/",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "smoothedPlusDM", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "smoothedTR", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 100, valueType: "scalar" },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "variable", name: "smoothedMinusDM", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "smoothedTR", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 100, valueType: "scalar" },
          valueType: "scalar",
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
                left: {
                  type: "bar_value",
                  source: { type: "variable", name: "pdi", valueType: "bar" },
                  valueType: "scalar",
                },
                right: {
                  type: "bar_value",
                  source: { type: "variable", name: "mdi", valueType: "bar" },
                  valueType: "scalar",
                },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            right: {
              type: "binary_op",
              operator: "+",
              left: {
                type: "bar_value",
                source: { type: "variable", name: "pdi", valueType: "bar" },
                valueType: "scalar",
              },
              right: {
                type: "bar_value",
                source: { type: "variable", name: "mdi", valueType: "bar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 100, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "adx",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          source: { type: "variable", name: "dx", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: {
            type: "constant",
            value: 2,
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "jaw",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice", valueType: "bar" },
          period: {
            type: "param",
            name: "jawPeriod",
            valueType: "scalar",
          },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "jawPeriod", valueType: "scalar" },
      },
      {
        name: "teeth",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice", valueType: "bar" },
          period: {
            type: "param",
            name: "teethPeriod",
            valueType: "scalar",
          },
          valueType: "scalar",
        },
        invalidPeriod: {
          type: "param",
          name: "teethPeriod",
          valueType: "scalar",
        },
      },
      {
        name: "lips",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice", valueType: "bar" },
          period: { type: "param", name: "lipsPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "lipsPeriod", valueType: "scalar" },
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 2, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "smaFast",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice", valueType: "bar" },
          period: { type: "param", name: "fastPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "fastPeriod", valueType: "scalar" },
      },
      {
        name: "smaSlow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice", valueType: "bar" },
          period: { type: "param", name: "slowPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "slowPeriod", valueType: "scalar" },
      },
      {
        name: "ao",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "smaFast", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "smaSlow", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
          left: {
            type: "bar_value",
            source: { type: "source", name: "high", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "source", name: "low", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "source",
                name: "source",
                valueType: "bar",
              },
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "source",
                name: "source",
                valueType: "bar",
              },
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "variable", name: "tr1", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "tr2", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "tr3", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "atr",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "rma" },
          source: { type: "variable", name: "trueRange", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
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
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "bears",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "source", name: "low", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "ema", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "stddev",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "std" },
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "upper",
        expression: {
          type: "binary_op",
          operator: "+",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "middle", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "binary_op",
            operator: "*",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "stddev", valueType: "bar" },
              valueType: "scalar",
            },
            right: { type: "param", name: "deviation", valueType: "scalar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "lower",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "middle", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "binary_op",
            operator: "*",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "stddev", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "deviation", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
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
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "bulls",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "source", name: "high", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "ema", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
              left: {
                type: "bar_value",
                source: { type: "source", name: "high", valueType: "bar" },
                valueType: "scalar",
              },
              right: {
                type: "bar_value",
                source: { type: "source", name: "low", valueType: "bar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "source", name: "close", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 3, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "smaTp",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "tp", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "dev",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "mean_absolute_deviation" },
          source: { type: "variable", name: "tp", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "cci",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "-",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "tp", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "smaTp", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: {
            type: "binary_op",
            operator: "*",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "dev", valueType: "bar" },
              valueType: "scalar",
            },
            right: { type: "constant", value: 0.015, valueType: "scalar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "source",
                name: "high",
                valueType: "bar",
              },
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
              valueType: "scalar",
            },
          },
          trueExpr: {
            type: "binary_op",
            operator: "-",
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "source",
                name: "high",
                valueType: "bar",
              },
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "down",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "<",
            left: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "source",
                name: "low",
                valueType: "bar",
              },
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
              valueType: "scalar",
            },
          },
          trueExpr: {
            type: "binary_op",
            operator: "-",
            left: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "sumUp",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "up", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "sumDown",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "down", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "dem",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "sumUp", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "binary_op",
            operator: "+",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "sumUp", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "sumDown", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
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
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "upper",
        expression: {
          type: "binary_op",
          operator: "*",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "basis", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "binary_op",
            operator: "+",
            left: { type: "constant", value: 1, valueType: "scalar" },
            right: {
              type: "binary_op",
              operator: "/",
              left: { type: "param", name: "deviation", valueType: "scalar" },
              right: { type: "constant", value: 100, valueType: "scalar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "lower",
        expression: {
          type: "binary_op",
          operator: "*",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "basis", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "binary_op",
            operator: "-",
            left: { type: "constant", value: 1, valueType: "scalar" },
            right: {
              type: "binary_op",
              operator: "/",
              left: { type: "param", name: "deviation", valueType: "scalar" },
              right: { type: "constant", value: 100, valueType: "scalar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "close", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "source",
                name: "source",
                valueType: "bar",
              },
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "source", name: "volume", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "force",
        expression: {
          type: "aggregation",
          method: { type: "param", name: "method" },
          source: { type: "variable", name: "rawForce", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
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
          source: { type: "source", name: "high", valueType: "bar" },
          period: { type: "constant", value: 5, valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "constant", value: 5, valueType: "scalar" },
      },
      {
        name: "lowMin",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low", valueType: "bar" },
          period: { type: "constant", value: 5, valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "constant", value: 5, valueType: "scalar" },
      },
      {
        name: "upFractal",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "==",
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "highMax", valueType: "bar" },
              valueType: "scalar",
            },
          },
          trueExpr: {
            type: "bar_value",
            source: { type: "source", name: "high", valueType: "bar" },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "downFractal",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "==",
            left: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "lowMin", valueType: "bar" },
              valueType: "scalar",
            },
          },
          trueExpr: {
            type: "bar_value",
            source: { type: "source", name: "low", valueType: "bar" },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 2, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "jaw",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice", valueType: "bar" },
          period: { type: "param", name: "jawPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "jawPeriod", valueType: "scalar" },
      },
      {
        name: "teeth",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "medianPrice", valueType: "bar" },
          period: { type: "param", name: "teethPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "teethPeriod", valueType: "scalar" },
      },
      {
        name: "gatorUpper",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "jaw", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "teeth", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "gatorLower",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "teeth", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "jaw", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
          source: { type: "source", name: "high", valueType: "bar" },
          period: { type: "param", name: "tenkanPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "tenkanPeriod", valueType: "scalar" },
      },
      {
        name: "tenkanLow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low", valueType: "bar" },
          period: { type: "param", name: "tenkanPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "tenkanPeriod", valueType: "scalar" },
      },
      {
        name: "tenkan",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "tenkanHigh", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "tenkanLow", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 2, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "kijunHigh",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "max" },
          source: { type: "source", name: "high", valueType: "bar" },
          period: { type: "param", name: "kijunPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "kijunLow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low", valueType: "bar" },
          period: { type: "param", name: "kijunPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "kijunPeriod", valueType: "scalar" },
      },
      {
        name: "kijun",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "kijunHigh", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "kijunLow", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 2, valueType: "scalar" },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "variable", name: "tenkan", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "kijun", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 2, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "senkouBHigh",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "max" },
          source: { type: "source", name: "high", valueType: "bar" },
          period: { type: "param", name: "senkouPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "senkouPeriod", valueType: "scalar" },
      },
      {
        name: "senkouBLow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "min" },
          source: { type: "source", name: "low", valueType: "bar" },
          period: { type: "param", name: "senkouPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "senkouPeriod", valueType: "scalar" },
      },
      {
        name: "senkouB",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "+",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "senkouBHigh", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "senkouBLow", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 2, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "chikou",
        expression: {
          type: "bar_value",
          source: { type: "source", name: "close", valueType: "bar" },
          shiftBars: { type: "param", name: "kijunPeriod", valueType: "scalar" },
          valueType: "scalar",
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
            left: {
              type: "bar_value",
              source: { type: "source", name: "high", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "source", name: "low", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "source", name: "volume", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
          left: {
            type: "bar_value",
            source: { type: "source", name: "source", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: {
              type: "source",
              name: "source",
              valueType: "bar",
            },
            shiftBars: { type: "param", name: "period", valueType: "scalar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
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
              left: {
                type: "bar_value",
                source: { type: "source", name: "high", valueType: "bar" },
                valueType: "scalar",
              },
              right: {
                type: "bar_value",
                source: { type: "source", name: "low", valueType: "bar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "source", name: "close", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: { type: "constant", value: 3, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "rawMoneyFlow",
        expression: {
          type: "binary_op",
          operator: "*",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "tp", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "source", name: "close", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "positiveFlow",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "tp", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "variable",
                name: "tp",
                valueType: "bar",
              },
              valueType: "scalar",
              shiftBars: {
                type: "constant",
                value: 1,
                valueType: "scalar",
              },
            },
          },
          trueExpr: {
            type: "bar_value",
            source: { type: "variable", name: "rawMoneyFlow", valueType: "bar" },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "negativeFlow",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "<",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "tp", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: {
                type: "variable",
                name: "tp",
                valueType: "bar",
              },
              shiftBars: { type: "constant", value: 1, valueType: "scalar" },
              valueType: "scalar",
            },
          },
          trueExpr: {
            type: "bar_value",
            source: { type: "variable", name: "rawMoneyFlow", valueType: "bar" },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "sumPositive",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "positiveFlow", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "sumNegative",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "negativeFlow", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "moneyRatio",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "sumPositive", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "sumNegative", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "mfi",
        expression: {
          type: "binary_op",
          operator: "-",
          left: { type: "constant", value: 100, valueType: "scalar" },
          right: {
            type: "binary_op",
            operator: "/",
            left: { type: "constant", value: 100, valueType: "scalar" },
            right: {
              type: "binary_op",
              operator: "+",
              left: { type: "constant", value: 1, valueType: "scalar" },
              right: {
                type: "bar_value",
                source: { type: "variable", name: "moneyRatio", valueType: "bar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          valueType: "scalar",
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
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
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
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "fastPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "fastPeriod", valueType: "scalar" },
      },
      {
        name: "slowEma",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "slowPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "slowPeriod", valueType: "scalar" },
      },
      {
        name: "macd",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "fastEma", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "slowEma", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "signal",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "macd", valueType: "bar" },
          period: { type: "param", name: "signalPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "signalPeriod", valueType: "scalar" },
      },
      {
        name: "histogram",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "macd", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "signal", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "fastPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "fastPeriod", valueType: "scalar" },
      },
      {
        name: "emaSlow",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "slowPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "slowPeriod", valueType: "scalar" },
      },
      {
        name: "macd",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "emaFast", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "emaSlow", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "signal",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "ema" },
          source: { type: "variable", name: "macd", valueType: "bar" },
          period: { type: "param", name: "signalPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "signalPeriod", valueType: "scalar" },
      },
      {
        name: "histogram",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "macd", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "signal", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
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
          left: {
            type: "bar_value",
            source: { type: "source", name: "source", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: {
              type: "source",
              name: "source",
              valueType: "bar",
            },
            shiftBars: { type: "constant", value: 1, valueType: "scalar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "directionalVolume",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "change", valueType: "bar" },
              valueType: "scalar",
            },
            right: { type: "constant", value: 0, valueType: "scalar" },
          },
          trueExpr: {
            type: "bar_value",
            source: { type: "source", name: "volume", valueType: "bar" },
            valueType: "scalar",
          },
          falseExpr: {
            type: "ternary",
            condition: {
              type: "comparison",
              operator: "<",
              left: {
                type: "bar_value",
                source: { type: "variable", name: "change", valueType: "bar" },
                valueType: "scalar",
              },
              right: { type: "constant", value: 0, valueType: "scalar" },
            },
            trueExpr: {
              type: "unary_op",
              operator: "-",
              operand: {
                type: "bar_value",
                source: { type: "source", name: "volume", valueType: "bar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            falseExpr: { type: "constant", value: 0, valueType: "scalar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "obv",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sum" },
          source: { type: "variable", name: "directionalVolume", valueType: "bar" },
          period: { type: "constant", value: 0, valueType: "scalar" }, // 全期間累積
          valueType: "scalar",
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
          left: {
            type: "bar_value",
            source: { type: "source", name: "source", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: {
              type: "source",
              name: "source",
              valueType: "bar",
            },
            shiftBars: { type: "constant", value: 1, valueType: "scalar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "gain",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: ">",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "delta", valueType: "bar" },
              valueType: "scalar",
            },
            right: { type: "constant", value: 0, valueType: "scalar" },
          },
          trueExpr: {
            type: "bar_value",
            source: { type: "variable", name: "delta", valueType: "bar" },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
        },
      },
      {
        name: "loss",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            operator: "<",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "delta", valueType: "bar" },
              valueType: "scalar",
            },
            right: { type: "constant", value: 0, valueType: "scalar" },
          },
          trueExpr: {
            type: "unary_op",
            operator: "abs",
            operand: {
              type: "bar_value",
              source: { type: "variable", name: "delta", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          falseExpr: { type: "constant", value: 0, valueType: "scalar" },
          valueType: "scalar",
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
                type: "bar_value",
                source: { type: "variable", name: "avgGain", valueType: "bar" },
                shiftBars: { type: "constant", value: 1, valueType: "scalar" },
                valueType: "scalar",
              },
              operator: "*",
              right: {
                type: "binary_op",
                left: { type: "param", name: "period", valueType: "scalar" },
                operator: "-",
                right: { type: "constant", value: 1, valueType: "scalar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            operator: "+",
            right: {
              type: "bar_value",
              source: { type: "variable", name: "gain", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          operator: "/",
          right: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: {
          type: "binary_op",
          left: { type: "param", name: "period", valueType: "scalar" },
          operator: "+",
          right: { type: "constant", value: 1, valueType: "scalar" },
          valueType: "scalar",
        },
        fallback: {
          expression: {
            type: "aggregation",
            method: { type: "aggregationType", value: "sma" },
            source: { type: "variable", name: "gain", valueType: "bar" },
            period: { type: "param", name: "period", valueType: "scalar" },
            valueType: "scalar",
          },
          invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
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
                type: "bar_value",
                source: { type: "variable", name: "avgLoss", valueType: "bar" },
                shiftBars: { type: "constant", value: 1, valueType: "scalar" },
                valueType: "scalar",
              },
              operator: "*",
              right: {
                type: "binary_op",
                left: { type: "param", name: "period", valueType: "scalar" },
                operator: "-",
                right: { type: "constant", value: 1, valueType: "scalar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            operator: "+",
            right: {
              type: "bar_value",
              source: { type: "variable", name: "loss", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          operator: "/",
          right: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: {
          type: "binary_op",
          left: { type: "param", name: "period", valueType: "scalar" },
          operator: "+",
          right: { type: "constant", value: 1, valueType: "scalar" },
          valueType: "scalar",
        },
        fallback: {
          expression: {
            type: "aggregation",
            method: { type: "aggregationType", value: "sma" },
            source: { type: "variable", name: "loss", valueType: "bar" },
            period: { type: "param", name: "period", valueType: "scalar" },
            valueType: "scalar",
          },
          invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
        },
      },
      {
        name: "rsi",
        expression: {
          type: "ternary",
          condition: {
            type: "comparison",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "avgLoss", valueType: "bar" },
              valueType: "scalar",
            },
            operator: "!=",
            right: { type: "constant", value: 0, valueType: "scalar" },
          },
          trueExpr: {
            type: "binary_op",
            left: { type: "constant", value: 100, valueType: "scalar" },
            operator: "-",
            right: {
              type: "binary_op",
              left: { type: "constant", value: 100, valueType: "scalar" },
              operator: "/",
              right: {
                type: "binary_op",
                left: { type: "constant", value: 1, valueType: "scalar" },
                operator: "+",
                right: {
                  type: "binary_op",
                  left: {
                    type: "bar_value",
                    source: { type: "variable", name: "avgGain", valueType: "bar" },
                    valueType: "scalar",
                  },
                  operator: "/",
                  right: {
                    type: "bar_value",
                    source: { type: "variable", name: "avgLoss", valueType: "bar" },
                    valueType: "scalar",
                  },
                  valueType: "scalar",
                },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          falseExpr: {
            type: "ternary",
            condition: {
              type: "comparison",
              left: {
                type: "bar_value",
                source: { type: "variable", name: "avgGain", valueType: "bar" },
                valueType: "scalar",
              },
              operator: "!=",
              right: { type: "constant", value: 0, valueType: "scalar" },
            },
            trueExpr: { type: "constant", value: 100, valueType: "scalar" },
            falseExpr: { type: "constant", value: 50, valueType: "scalar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
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
        name: "diff_co",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "source", name: "close", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "source", name: "open", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "num",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: {
            type: "variable",
            name: "diff_oc",
            valueType: "bar",
          },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "diff_hl",
        expression: {
          type: "binary_op",
          operator: "-",
          left: {
            type: "bar_value",
            source: { type: "source", name: "high", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "source", name: "low", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "den",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: {
            type: "variable",
            name: "diff_hl",
            valueType: "bar",
          },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
      },
      {
        name: "rvi",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "num", valueType: "bar" },
            valueType: "scalar",
          },
          right: {
            type: "bar_value",
            source: { type: "variable", name: "den", valueType: "bar" },
            valueType: "scalar",
          },
          valueType: "scalar",
        },
      },
      {
        name: "signal",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "rvi", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
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
          source: { type: "source", name: "source", valueType: "bar" },
          period: { type: "param", name: "period", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "period", valueType: "scalar" },
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
          source: { type: "source", name: "low", valueType: "bar" },
          period: { type: "param", name: "kPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "kPeriod", valueType: "scalar" },
      },
      {
        name: "highestHigh",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "max" },
          source: { type: "source", name: "high", valueType: "bar" },
          period: { type: "param", name: "kPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "kPeriod", valueType: "scalar" },
      },
      {
        name: "rawK",
        expression: {
          type: "binary_op",
          operator: "/",
          left: {
            type: "binary_op",
            operator: "-",
            left: {
              type: "bar_value",
              source: { type: "source", name: "close", valueType: "bar" },
              valueType: "scalar",
            },
            right: {
              type: "bar_value",
              source: { type: "variable", name: "lowestLow", valueType: "bar" },
              valueType: "scalar",
            },
            valueType: "scalar",
          },
          right: {
            type: "binary_op",
            operator: "-",
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
          valueType: "scalar",
        },
      },
      {
        name: "k",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "rawK", valueType: "bar" },
          period: { type: "param", name: "slowing", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "slowing", valueType: "scalar" },
      },
      {
        name: "d",
        expression: {
          type: "aggregation",
          method: { type: "aggregationType", value: "sma" },
          source: { type: "variable", name: "k", valueType: "bar" },
          period: { type: "param", name: "dPeriod", valueType: "scalar" },
          valueType: "scalar",
        },
        invalidPeriod: { type: "param", name: "dPeriod", valueType: "scalar" },
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
              left: {
                type: "bar_value",
                source: { type: "variable", name: "highestHigh", valueType: "bar" },
                valueType: "scalar",
              },
              right: {
                type: "bar_value",
                source: { type: "source", name: "close", valueType: "bar" },
                valueType: "scalar",
              },
              valueType: "scalar",
            },
            right: {
              type: "binary_op",
              operator: "-",
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
            valueType: "scalar",
          },
          right: { type: "constant", value: -100, valueType: "scalar" },
          valueType: "scalar",
        },
      },
    ],
    exports: [{ name: "percentR", variableName: "percentR" }],
  },
};
