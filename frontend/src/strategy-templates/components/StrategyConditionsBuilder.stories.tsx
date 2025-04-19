import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import StrategyConditionsBuilder from "./StrategyConditionsBuilder";
import VariableProvider from "./VariableProvider";

const meta = {
  component: StrategyConditionsBuilder,
  args: { onChange: fn() },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          {
            name: "var1",
            expression: { type: "constant", value: 1, valueType: "scalar" },
            description: "constant(scalar)",
          },
          {
            name: "var2",
            expression: { type: "price", source: "open", valueType: "scalar" },
            description: "price(array)",
          },
          {
            name: "var3",
            expression: { type: "indicator", name: "ind1", params: [], lineName: "default", valueType: "scalar" },
            description: "indicator(array)",
          },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
} satisfies Meta<typeof StrategyConditionsBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Comparison: Story = {
  args: {
    value: [
      {
        type: "comparison",
        operator: ">",
        left: { type: "constant", value: 100, valueType: "scalar" },
        right: {
          type: "bar_value",
          source: { type: "variable", name: "", valueType: "bar" },
          valueType: "scalar",
        },
      },
    ],
  },
};

export const Cross: Story = {
  args: {
    value: [
      {
        type: "cross",
        direction: "cross_over",
        left: { type: "constant", value: 100, valueType: "scalar" },
        right: { type: "variable", name: "", valueType: "bar" },
      },
    ],
  },
};

export const Change: Story = {
  args: {
    value: [
      {
        type: "change",
        change: "to_false",
        condition: {
          type: "comparison",
          operator: ">",
          left: { type: "constant", value: 100, valueType: "scalar" },
          right: { type: "constant", value: 300, valueType: "scalar" },
        },
      },
    ],
  },
};

export const State: Story = {
  args: {
    value: [
      {
        type: "state",
        state: "rising",
        consecutiveBars: 12,
        operand: { type: "variable", name: "", valueType: "bar" },
      },
    ],
  },
};

export const Continue: Story = {
  args: {
    value: [
      {
        type: "continue",
        continue: "true",
        consecutiveBars: 12,
        condition: {
          type: "comparison",
          left: {
            type: "bar_value",
            source: { type: "variable", name: "", valueType: "bar" },
            valueType: "scalar",
          },
          operator: "==",
          right: { type: "constant", value: 1, valueType: "scalar" },
        },
      },
    ],
  },
};

export const Group: Story = {
  args: {
    value: [
      {
        type: "group",
        operator: "and",
        conditions: [
          {
            type: "comparison",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "", valueType: "bar" },
              valueType: "scalar",
            },
            operator: ">=",
            right: { type: "constant", value: 1, valueType: "scalar" },
          },
          {
            type: "comparison",
            left: {
              type: "bar_value",
              source: { type: "variable", name: "", valueType: "bar" },
              valueType: "scalar",
            },
            operator: "<=",
            right: { type: "constant", value: 2, valueType: "scalar" },
          },
        ],
      },
    ],
  },
};
