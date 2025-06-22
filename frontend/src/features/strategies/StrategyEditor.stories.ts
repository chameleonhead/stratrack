import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import StrategyEditor from "./StrategyEditor";

const meta = {
  component: StrategyEditor,
  args: { onChange: fn() },
} satisfies Meta<typeof StrategyEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("戦略名"), "テスト");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const RSI14: Story = {
  args: {
    value: {
      template: {
        variables: [
          {
            name: "close",
            expression: {
              type: "scalar_price",
              source: "close",
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
                  ref: { type: "variable", name: "close" },
                },
              ],
              lineName: "rsi",
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
                  ref: { type: "variable", name: "rsi14" },
                },
              ],
              lineName: "ma",
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
                  ref: { type: "variable", name: "rsi_sma90" },
                },
              ],
              lineName: "ma",
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
                  },
                },
                {
                  type: "state",
                  state: "rising",
                  operand: {
                    type: "variable",
                    name: "rsi_sma90_sma90",
                  },
                },
                {
                  type: "continue",
                  consecutiveBars: 5,
                  continue: "true",
                  condition: {
                    type: "comparison",
                    left: {
                      type: "bar_shift",
                      source: { type: "variable", name: "rsi14" },
                      shiftBars: { type: "constant", value: 2 },
                    },
                    operator: ">",
                    right: { type: "constant", value: 30 },
                  },
                },
                {
                  type: "cross",
                  direction: "cross_over",
                  left: { type: "variable", name: "rsi14" },
                  right: { type: "constant", value: 30 },
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
                type: "bar_shift",
                source: { type: "variable", name: "rsi14" },
              },
              operator: ">",
              right: { type: "constant", value: 70 },
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
              type: "scalar_price",
              source: "close",
            },
          },
          {
            name: "high",
            expression: {
              type: "scalar_price",
              source: "high",
            },
          },
          {
            name: "low",
            expression: {
              type: "scalar_price",
              source: "low",
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
                  ref: { type: "variable", name: "high" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low" },
                },
                { name: "period", type: "number", value: 20 },
              ],
              lineName: "upper",
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
                  ref: { type: "variable", name: "high" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low" },
                },
                { name: "period", type: "number", value: 90 },
              ],
              lineName: "lower",
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
                  type: "bar_shift",
                  source: {
                    type: "variable",
                    name: "donchian_high",
                  },
                },
                right: {
                  type: "bar_shift",
                  source: {
                    type: "variable",
                    name: "donchian_low",
                  },
                },
              },
              right: {
                type: "constant",
                value: 2,
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
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "close",
                },
              },
              operator: ">",
              right: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "donchian_high",
                },
              },
            },
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "close",
                },
              },
              operator: "<",
              right: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "donchian_low",
                },
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
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "close",
                },
              },
              operator: "<",
              right: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "donchian_mid",
                },
              },
            },
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "close",
                },
              },
              operator: ">",
              right: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "donchian_mid",
                },
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
              type: "scalar_price",
              source: "median",
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
                  ref: { type: "variable", name: "median" },
                },
                { name: "fastPeriod", type: "number", value: 5 },
                { name: "slowPeriod", type: "number", value: 34 },
                { name: "signalPeriod", type: "number", value: 5 },
              ],
              lineName: "ac",
            },
          },
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "cross",
              direction: "cross_over",
              left: { type: "variable", name: "indicator" },
              right: { type: "constant", value: 0 },
            },
          },
          {
            type: "short",
            condition: {
              type: "cross",
              direction: "cross_under",
              left: { type: "variable", name: "indicator" },
              right: { type: "constant", value: 0 },
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
              type: "scalar_price",
              source: "high",
            },
          },
          {
            name: "low",
            expression: {
              type: "scalar_price",
              source: "low",
            },
          },
          {
            name: "close",
            expression: {
              type: "scalar_price",
              source: "close",
            },
          },
          {
            name: "tick_volume",
            expression: {
              type: "scalar_price",
              source: "tick_volume",
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
                  ref: { type: "variable", name: "high" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low" },
                },
                {
                  name: "close",
                  type: "source",
                  ref: { type: "variable", name: "close" },
                },
                {
                  name: "volume",
                  type: "source",
                  ref: { type: "variable", name: "tick_volume" },
                },
              ],
              lineName: "ad",
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
                  ref: { type: "variable", name: "high" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low" },
                },
                { name: "period", type: "number", value: 20 },
              ],
              lineName: "upper",
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
                  ref: { type: "variable", name: "high" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low" },
                },
                { name: "period", type: "number", value: 20 },
              ],
              lineName: "lower",
            },
          },
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "comparison",
              left: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "ad",
                },
                shiftBars: { type: "constant", value: 0 },
              },
              operator: ">",
              right: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "highest",
                },
              },
            },
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "ad",
                },
                shiftBars: { type: "constant", value: 0 },
              },
              operator: "<",
              right: {
                type: "bar_shift",
                source: {
                  type: "variable",
                  name: "lowest",
                },
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
              type: "scalar_price",
              source: "high",
            },
          },
          {
            name: "low",
            expression: {
              type: "scalar_price",
              source: "low",
            },
          },
          {
            name: "close",
            expression: {
              type: "scalar_price",
              source: "close",
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
                  ref: { type: "variable", name: "high" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low" },
                },
                {
                  name: "close",
                  type: "source",
                  ref: { type: "variable", name: "close" },
                },
                { name: "period", type: "number", value: 14 },
              ],
              lineName: "adx",
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
                  ref: { type: "variable", name: "high" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low" },
                },
                {
                  name: "close",
                  type: "source",
                  ref: { type: "variable", name: "close" },
                },
                { name: "period", type: "number", value: 14 },
              ],
              lineName: "pdi",
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
                  ref: { type: "variable", name: "high" },
                },
                {
                  name: "low",
                  type: "source",
                  ref: { type: "variable", name: "low" },
                },
                {
                  name: "close",
                  type: "source",
                  ref: { type: "variable", name: "close" },
                },
                { name: "period", type: "number", value: 14 },
              ],
              lineName: "mdi",
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
                    type: "bar_shift",
                    source: { type: "variable", name: "adx" },
                  },
                  operator: ">",
                  right: { type: "constant", value: 25 },
                },
                {
                  type: "comparison",
                  left: {
                    type: "bar_shift",
                    source: { type: "variable", name: "pdi" },
                  },
                  operator: ">",
                  right: {
                    type: "bar_shift",
                    source: { type: "variable", name: "mdi" },
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
                    type: "bar_shift",
                    source: { type: "variable", name: "adx" },
                  },
                  operator: ">",
                  right: { type: "constant", value: 25 },
                },
                {
                  type: "comparison",
                  left: {
                    type: "bar_shift",
                    source: { type: "variable", name: "pdi" },
                  },
                  operator: ">",
                  right: {
                    type: "bar_shift",
                    source: { type: "variable", name: "pdi" },
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
