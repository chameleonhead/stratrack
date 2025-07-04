import StrategyConditionOperandSelector from "./StrategyConditionOperandSelector";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";
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
            expression: { type: "constant", value: 1 },
            description: "constant(scalar)",
          },
          {
            name: "var2",
            expression: { type: "scalar_price", source: "open" },
            description: "price(array)",
          },
          {
            name: "var3",
            expression: {
              type: "indicator",
              name: "ind1",
              params: [],
              lineName: "default",
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
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText("定数（数値）"), "5");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const ScalarVariableOperand: Story = {
  args: {
    allowedTypes: ["scalar_variable"],
    value: {
      type: "bar_shift",
      source: {
        type: "variable",
        name: "value1",
      },
    },
  },
};

export const ArrayVariableOperand: Story = {
  args: {
    allowedTypes: ["array_variable"],
    value: {
      type: "variable",
      name: "value1",
    },
  },
};

export const ScalarPriceOperand: Story = {
  args: {
    allowedTypes: ["scalar_price"],
    value: {
      type: "scalar_price",
      source: "high",
    },
  },
};

export const ArrayPriceOperand: Story = {
  args: {
    allowedTypes: ["array_price"],
    value: {
      type: "bar_shift",
      source: {
        type: "price",
        source: "high",
      },
    },
  },
};
