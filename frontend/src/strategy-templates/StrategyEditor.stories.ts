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
                { name: "source", type: "source", value: "close" },
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
                { name: "method", type: "aggregationType", value: "sma" },
                { name: "period", type: "number", value: 90 },
                { name: "source", type: "source", value: "rsi14" },
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
                { name: "method", type: "aggregationType", value: "sma" },
                { name: "period", type: "number", value: 90 },
                { name: "source", type: "source", value: "rsi_sma90" },
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
                    valueType: "array",
                  },
                },
                {
                  type: "state",
                  state: "rising",
                  operand: {
                    type: "variable",
                    name: "rsi_sma90_sma90",
                    valueType: "array",
                  },
                },
                {
                  type: "continue",
                  length: 5,
                  continue: "true",
                  condition: {
                    type: "comparison",
                    left: {
                      type: "variable",
                      name: "rsi14",
                      shiftBars: { type: "constant", value: 2 },
                      valueType: "scalar",
                    },
                    operator: ">",
                    right: { type: "constant", value: 30 },
                  },
                },
                {
                  type: "cross",
                  direction: "cross_over",
                  left: { type: "variable", name: "rsi14", valueType: "array" },
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
              left: { type: "variable", name: "rsi14", valueType: "scalar" },
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
                { name: "high", type: "source", value: "high" },
                { name: "low", type: "source", value: "low" },
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
                { name: "high", type: "source", value: "high" },
                { name: "low", type: "source", value: "low" },
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
                  type: "variable",
                  name: "donchian_high",
                  valueType: "scalar",
                },
                right: {
                  type: "variable",
                  name: "donchian_low",
                  valueType: "scalar",
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
                type: "variable",
                name: "close",
                valueType: "scalar",
              },
              operator: ">",
              right: {
                type: "variable",
                name: "donchian_high",
                valueType: "scalar",
              },
            },
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "variable",
                name: "close",
                valueType: "scalar",
              },
              operator: "<",
              right: {
                type: "variable",
                name: "donchian_low",
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
                type: "variable",
                name: "close",
                valueType: "scalar",
              },
              operator: "<",
              right: {
                type: "variable",
                name: "donchian_mid",
                valueType: "scalar",
              },
            },
          },
          {
            type: "short",
            condition: {
              type: "comparison",
              left: {
                type: "variable",
                name: "close",
                valueType: "scalar",
              },
              operator: ">",
              right: {
                type: "variable",
                name: "donchian_mid",
                valueType: "scalar",
              },
            },
          },
        ],
        riskManagement: {
          type: "fixed",
          lotSize: 1,
        },
        positionManagement: {
          trailingStop: {
            enabled: false,
            distance: null,
          },
          takeProfit: {
            enabled: false,
            target: null,
          },
          stopLoss: {
            enabled: false,
            limit: null,
          },
        },
        environmentFilter: {
          trendCondition: false,
          volatilityCondition: false,
          avoidNews: false,
        },
        timingControl: {
          allowedTradingPeriods: [
            {
              day: "mon",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "tue",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "wed",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "thu",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "fri",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
          ],
          forceCloseBeforeDisallowed: false,
          allowExitDuringDisallowed: true,
        },
        multiPositionControl: {
          maxPositions: 1,
          allowHedging: false,
        },
      },
    },
  },
};

export const Accelerator: Story = {
  args: {
    value: {
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
                { name: "median", type: "source", value: "median" },
                { name: "fastPeriod", type: "number", value: 5 },
                { name: "slowPeriod", type: "number", value: 34 },
              ],
              lineName: "ac",
            },
          },
        ],
        entry: [
          {
            type: "long",
            condition: {
              type: "change",
              change: "to_true",
              condition: {
                type: "comparison",
                left: {
                  type: "variable",
                  name: "indicator",
                  valueType: "scalar",
                },
                operator: ">",
                right: {
                  type: "constant",
                  value: 0,
                },
              },
            },
          },
          {
            type: "short",
            condition: {
              type: "change",
              change: "to_true",
              condition: {
                type: "comparison",
                left: {
                  type: "variable",
                  name: "indicator",
                  valueType: "scalar",
                },
                operator: "<",
                right: {
                  type: "constant",
                  value: 0,
                },
              },
            },
          },
        ],
        exit: [],
        riskManagement: {
          type: "fixed",
          lotSize: 1,
        },
        positionManagement: {
          trailingStop: {
            enabled: true,
            distance: 10,
          },
          takeProfit: {
            enabled: true,
            target: 10,
          },
          stopLoss: {
            enabled: true,
            limit: 10,
          },
        },
        environmentFilter: {
          trendCondition: false,
          volatilityCondition: false,
          avoidNews: false,
        },
        timingControl: {
          allowedTradingPeriods: [
            {
              day: "mon",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "tue",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "wed",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "thu",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "fri",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
          ],
          forceCloseBeforeDisallowed: false,
          allowExitDuringDisallowed: true,
        },
        multiPositionControl: {
          maxPositions: 1,
          allowHedging: false,
        },
      },
    },
  },
};

export const AccumulationDistribution: Story = {
  args: {
    value: {
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
            name: "indicator",
            expression: {
              type: "indicator",
              name: "accumulation_distribution",
              params: [
                { name: "high", type: "source", value: "high" },
                { name: "low", type: "source", value: "low" },
                { name: "close", type: "source", value: "close" },
                { name: "tick_volume", type: "source", value: "tick_volume" },
              ],
              lineName: "ad",
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
                    name: "indicator",
                    valueType: "array",
                  },
                },
                {
                  type: "state",
                  state: "falling",
                  operand: {
                    type: "variable",
                    name: "close",
                    valueType: "array",
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
                  type: "state",
                  state: "falling",
                  operand: {
                    type: "variable",
                    name: "indicator",
                    valueType: "array",
                  },
                },
                {
                  type: "state",
                  state: "rising",
                  operand: {
                    type: "variable",
                    name: "close",
                    valueType: "array",
                  },
                },
              ],
            },
          },
        ],
        exit: [],
        riskManagement: {
          type: "fixed",
          lotSize: 1,
        },
        positionManagement: {
          trailingStop: {
            enabled: true,
            distance: 10,
          },
          takeProfit: {
            enabled: true,
            target: 10,
          },
          stopLoss: {
            enabled: true,
            limit: 10,
          },
        },
        environmentFilter: {
          trendCondition: false,
          volatilityCondition: false,
          avoidNews: false,
        },
        timingControl: {
          allowedTradingPeriods: [
            {
              day: "mon",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "tue",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "wed",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "thu",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
            {
              day: "fri",
              timeRange: {
                from: "00:00",
                to: "23:59",
              },
            },
          ],
          forceCloseBeforeDisallowed: false,
          allowExitDuringDisallowed: true,
        },
        multiPositionControl: {
          maxPositions: 1,
          allowHedging: false,
        },
      },
    },
  },
};
