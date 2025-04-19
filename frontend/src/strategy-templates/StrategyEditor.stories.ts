import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import StrategyEditor from "./StrategyEditor";

const meta = {
  component: StrategyEditor,
  args: { onChange: fn() },
} satisfies Meta<typeof StrategyEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const RSI14: Story = {
  args: {
    value: {
      template: {
        variables: [
          {
            name: "close",
            expression: {
              type: "price",
              source: "close",
              valueType: "scalar",
            },
          },
          {
            name: "rsi14",
            expression: {
              type: "indicator",
              name: "rsi",
              params: [
                { name: "period", type: "number", value: 14 },
                {
                  name: "source",
                  type: "source",
                  ref: { type: "variable", name: "close", valueType: "bar" },
                },
              ],
              lineName: "rsi",
              valueType: "scalar",
            },
          },
          {
            name: "rsi_sma90",
            expression: {
              type: "indicator",
              name: "moving_average",
              params: [
                { name: "method", type: "aggregationType", method: "sma" },
                { name: "period", type: "number", value: 90 },
                {
                  name: "source",
                  type: "source",
                  ref: { type: "variable", name: "rsi14", valueType: "bar" },
                },
              ],
              lineName: "ma",
              valueType: "scalar",
            },
          },
          {
            name: "rsi_sma90_sma90",
            expression: {
              type: "indicator",
              name: "moving_average",
              params: [
                { name: "method", type: "aggregationType", method: "sma" },
                { name: "period", type: "number", value: 90 },
                {
                  name: "source",
                  type: "source",
                  ref: { type: "variable", name: "rsi_sma90", valueType: "bar" },
                },
              ],
              lineName: "ma",
              valueType: "scalar",
            },
          },
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "group",
              operator: "and",
              conditions: [
                {
                  type: "state",
                  state: "rising",
                  operand: {
                    type: "variable",
                    name: "rsi_sma90",
                    valueType: "bar",
                  },
                },
                {
                  type: "state",
                  state: "rising",
                  operand: {
                    type: "variable",
                    name: "rsi_sma90_sma90",
                    valueType: "bar",
                  },
                },
                {
                  type: "continue",
                  consecutiveBars: 5,
                  continue: "true",
                  condition: {
                    type: "comparison",
                    left: {
                      type: "bar_value",
                      source: { type: "variable", name: "rsi14", valueType: "bar" },
                      shiftBars: { type: "constant", value: 2, valueType: "scalar" },
                      valueType: "scalar",
                    },
                    operator: ">",
                    right: { type: "constant", value: 30, valueType: "scalar" },
                  },
                },
                {
                  type: "cross",
                  direction: "cross_over",
                  left: { type: "variable", name: "rsi14", valueType: "bar" },
                  right: { type: "constant", value: 30, valueType: "scalar" },
                },
              ],
            },
          },
        ],
        exit: [
          {
            type: "long",
            condition: {
              type: "comparison",
              left: {
                type: "bar_value",
                source: { type: "variable", name: "rsi14", valueType: "bar" },
                valueType: "scalar",
              },
              operator: ">",
              right: { type: "constant", value: 70, valueType: "scalar" },
            },
          },
        ],
        riskManagement: {
          type: "fixed",
          lotSize: 1,
        },
      },
    },
  },
};

export const DonchianChannel: Story = {
  args: {
    value: {
      template: {
        variables: [
          {
            name: "close",
            expression: {
              type: "price",
              source: "close",
              valueType: "scalar",
            },
          },
          {
            name: "high",
            expression: {
              type: "price",
              source: "high",
              valueType: "scalar",
            },
          },
          {
            name: "low",
            expression: {
              type: "price",
              source: "low",
              valueType: "scalar",
            },
          },
          {
            name: "donchian_high",
            expression: {
              type: "indicator",
              name: "donchian_channel",
              params: [
                {
                  name: "high",
                  type: "source",
                  ref: { type: "variable", name: "high", valueType: "bar" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low", valueType: "bar" },
                },
                { name: "period", type: "number", value: 20 },
              ],
              lineName: "upper",
              valueType: "scalar",
            },
          },
          {
            name: "donchian_low",
            expression: {
              type: "indicator",
              name: "donchian_channel",
              params: [
                {
                  name: "high",
                  type: "source",
                  ref: { type: "variable", name: "high", valueType: "bar" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low", valueType: "bar" },
                },
                { name: "period", type: "number", value: 90 },
              ],
              lineName: "lower",
              valueType: "scalar",
            },
          },
          {
            name: "donchian_mid",
            expression: {
              type: "binary_op",
              operator: "/",
              left: {
                type: "binary_op",
                operator: "+",
                left: {
                  type: "bar_value",
                  source: {
                    type: "variable",
                    name: "donchian_high",
                    valueType: "bar",
                  },
                  valueType: "scalar",
                },
                right: {
                  type: "bar_value",
                  source: {
                    type: "variable",
                    name: "donchian_low",
                    valueType: "bar",
                  },
                  valueType: "scalar",
                },
              },
              right: {
                type: "constant",
                value: 2,
                valueType: "scalar",
              },
            },
          },
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "comparison",
              left: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "close",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
              operator: ">",
              right: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "donchian_high",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
            },
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "close",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
              operator: "<",
              right: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "donchian_low",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
            },
          },
        ],
        exit: [
          {
            type: "long",
            condition: {
              type: "comparison",
              left: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "close",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
              operator: "<",
              right: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "donchian_mid",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
            },
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "close",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
              operator: ">",
              right: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "donchian_mid",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
            },
          },
        ],
        riskManagement: {
          type: "fixed",
          lotSize: 1,
        },
      },
    },
  },
};

export const Accelerator: Story = {
  args: {
    value: {
      id: "accel-strategy-001",
      name: "Accelerator戦略",
      nameEn: "Accelerator Strategy",
      description:
        "Accelerator Oscillatorがゼロをクロスしたタイミングでエントリーするシンプルな戦略です。",
      version: "1.0.0",
      template: {
        variables: [
          {
            name: "median",
            expression: {
              type: "price",
              source: "median",
              valueType: "scalar",
            },
          },
          {
            name: "indicator",
            expression: {
              type: "indicator",
              name: "accelerator",
              params: [
                {
                  name: "median",
                  type: "source",
                  ref: { type: "variable", name: "median", valueType: "bar" },
                },
                { name: "fastPeriod", type: "number", value: 5 },
                { name: "slowPeriod", type: "number", value: 34 },
                { name: "signalPeriod", type: "number", value: 5 },
              ],
              lineName: "ac",
              valueType: "scalar",
            },
          },
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "cross",
              direction: "cross_over",
              left: { type: "variable", name: "indicator", valueType: "bar" },
              right: { type: "constant", value: 0, valueType: "scalar" },
            },
          },
          {
            type: "short",
            condition: {
              type: "cross",
              direction: "cross_under",
              left: { type: "variable", name: "indicator", valueType: "bar" },
              right: { type: "constant", value: 0, valueType: "scalar" },
            },
          },
        ],
        exit: [],
        riskManagement: {
          type: "fixed",
          lotSize: 0.1,
        },
      },
    },
  },
};

export const AccumulationDistribution: Story = {
  args: {
    value: {
      id: "ad-strategy-001",
      name: "A/D ラインブレイク戦略",
      nameEn: "Accumulation/Distribution Strategy",
      description:
        "A/Dインジケーターが直近のピーク・ボトムを更新したらエントリーするシンプルなトレンド追従戦略",
      version: "1.0.0",
      template: {
        variables: [
          {
            name: "high",
            expression: {
              type: "price",
              source: "high",
              valueType: "scalar",
            },
          },
          {
            name: "low",
            expression: {
              type: "price",
              source: "low",
              valueType: "scalar",
            },
          },
          {
            name: "close",
            expression: {
              type: "price",
              source: "close",
              valueType: "scalar",
            },
          },
          {
            name: "tick_volume",
            expression: {
              type: "price",
              source: "tick_volume",
              valueType: "scalar",
            },
          },
          {
            name: "ad",
            expression: {
              type: "indicator",
              name: "accumulation_distribution",
              params: [
                {
                  name: "high",
                  type: "source",
                  ref: { type: "variable", name: "high", valueType: "bar" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low", valueType: "bar" },
                },
                {
                  name: "close",
                  type: "source",
                  ref: { type: "variable", name: "close", valueType: "bar" },
                },
                {
                  name: "volume",
                  type: "source",
                  ref: { type: "variable", name: "tick_volume", valueType: "bar" },
                },
              ],
              lineName: "ad",
              valueType: "scalar",
            },
          },
          {
            name: "highest",
            expression: {
              type: "indicator",
              name: "donchian_channel",
              params: [
                {
                  name: "high",
                  type: "source",
                  ref: { type: "variable", name: "high", valueType: "bar" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low", valueType: "bar" },
                },
                { name: "period", type: "number", value: 20 },
              ],
              lineName: "upper",
              valueType: "scalar",
            },
          },
          {
            name: "lowest",
            expression: {
              type: "indicator",
              name: "donchian_channel",
              params: [
                {
                  name: "high",
                  type: "source",
                  ref: { type: "variable", name: "high", valueType: "bar" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low", valueType: "bar" },
                },
                { name: "period", type: "number", value: 20 },
              ],
              lineName: "lower",
              valueType: "scalar",
            },
          },
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "comparison",
              left: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "ad",
                  valueType: "bar",
                },
                shiftBars: { type: "constant", value: 0, valueType: "scalar" },
                valueType: "scalar",
              },
              operator: ">",
              right: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "highest",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
            },
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "ad",
                  valueType: "bar",
                },
                valueType: "scalar",
                shiftBars: { type: "constant", value: 0, valueType: "scalar" },
              },
              operator: "<",
              right: {
                type: "bar_value",
                source: {
                  type: "variable",
                  name: "lowest",
                  valueType: "bar",
                },
                valueType: "scalar",
              },
            },
          },
        ],
        exit: [],
        riskManagement: {
          type: "fixed",
          lotSize: 0.1,
        },
      },
    },
  },
};

export const ADX: Story = {
  args: {
    value: {
      id: "adx-strategy-001",
      name: "ADXトレンド追従戦略",
      nameEn: "ADX Trend Following Strategy",
      description: "ADXが上昇トレンドまたは下降トレンドを示したときにエントリーする戦略。",
      version: "1.0.0",
      template: {
        variables: [
          {
            name: "high",
            expression: {
              type: "price",
              source: "high",
              valueType: "scalar",
            },
          },
          {
            name: "low",
            expression: {
              type: "price",
              source: "low",
              valueType: "scalar",
            },
          },
          {
            name: "close",
            expression: {
              type: "price",
              source: "close",
              valueType: "scalar",
            },
          },
          {
            name: "adx",
            expression: {
              type: "indicator",
              name: "adx",
              params: [
                {
                  name: "high",
                  type: "source",
                  ref: { type: "variable", name: "high", valueType: "bar" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low", valueType: "bar" },
                },
                {
                  name: "close",
                  type: "source",
                  ref: { type: "variable", name: "close", valueType: "bar" },
                },
                { name: "period", type: "number", value: 14 },
              ],
              lineName: "adx",
              valueType: "scalar",
            },
          },
          {
            name: "pdi",
            expression: {
              type: "indicator",
              name: "adx",
              params: [
                {
                  name: "high",
                  type: "source",
                  ref: { type: "variable", name: "high", valueType: "bar" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low", valueType: "bar" },
                },
                {
                  name: "close",
                  type: "source",
                  ref: { type: "variable", name: "close", valueType: "bar" },
                },
                { name: "period", type: "number", value: 14 },
              ],
              lineName: "pdi",
              valueType: "scalar",
            },
          },
          {
            name: "mdi",
            expression: {
              type: "indicator",
              name: "adx",
              params: [
                {
                  name: "high",
                  type: "source",
                  ref: { type: "variable", name: "high", valueType: "bar" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low", valueType: "bar" },
                },
                {
                  name: "close",
                  type: "source",
                  ref: { type: "variable", name: "close", valueType: "bar" },
                },
                { name: "period", type: "number", value: 14 },
              ],
              lineName: "mdi",
              valueType: "scalar",
            },
          },
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "group",
              operator: "and",
              conditions: [
                {
                  type: "comparison",
                  left: {
                    type: "bar_value",
                    source: { type: "variable", name: "adx", valueType: "bar" },
                    valueType: "scalar",
                  },
                  operator: ">",
                  right: { type: "constant", value: 25, valueType: "scalar" },
                },
                {
                  type: "comparison",
                  left: {
                    type: "bar_value",
                    source: { type: "variable", name: "pdi", valueType: "bar" },
                    valueType: "scalar",
                  },
                  operator: ">",
                  right: {
                    type: "bar_value",
                    source: { type: "variable", name: "mdi", valueType: "bar" },
                    valueType: "scalar",
                  },
                },
              ],
            },
          },
          {
            type: "short",
            condition: {
              type: "group",
              operator: "and",
              conditions: [
                {
                  type: "comparison",
                  left: {
                    type: "bar_value",
                    source: { type: "variable", name: "adx", valueType: "bar" },
                    valueType: "scalar",
                  },
                  operator: ">",
                  right: { type: "constant", value: 25, valueType: "scalar" },
                },
                {
                  type: "comparison",
                  left: {
                    type: "bar_value",
                    source: { type: "variable", name: "pdi", valueType: "bar" },
                    valueType: "scalar",
                  },
                  operator: ">",
                  right: {
                    type: "bar_value",
                    source: { type: "variable", name: "pdi", valueType: "bar" },
                    valueType: "scalar",
                  },
                },
              ],
            },
          },
        ],
        exit: [],
        riskManagement: {
          type: "fixed",
          lotSize: 0.1,
        },
      },
    },
  },
};
