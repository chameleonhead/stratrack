import StrategyConditionOperandSelector from "./StrategyConditionOperandSelector";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import VariableProvider from "./VariableProvider";

const meta: Meta<typeof StrategyConditionOperandSelector> = {
  component: StrategyConditionOperandSelector,
  args: {
    onChange: fn(),
  },
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
            expression: {
              type: "indicator",
              name: "ind1",
              params: [],
              lineName: "default",
              valueType: "scalar",
            },
            description: "indicator(array)",
          },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof StrategyConditionOperandSelector>;

export const ConstantOperand: Story = {
  args: {
    allowedTypes: ["constant"],
    value: {
      type: "constant",
      value: 100,
      valueType: "scalar",
    },
  },
};

export const ScalarVariableOperand: Story = {
  args: {
    allowedTypes: ["scalar_variable"],
    value: {
      type: "bar_value",
      source: {
        type: "variable",
        name: "value1",
        valueType: "bar",
      },
      valueType: "scalar",
    },
  },
};

export const ArrayVariableOperand: Story = {
  args: {
    allowedTypes: ["array_variable"],
    value: {
      type: "variable",
      name: "value1",
      valueType: "bar",
    },
  },
};

export const ScalarPriceOperand: Story = {
  args: {
    allowedTypes: ["scalar_price"],
    value: {
      type: "price",
      source: "high",
      valueType: "scalar",
    },
  },
};

export const ArrayPriceOperand: Story = {
  args: {
    allowedTypes: ["array_price"],
    value: {
      type: "bar_value",
      source: {
        type: "price",
        source: "high",
        valueType: "bar",
      },
      valueType: "scalar",
    },
  },
};
