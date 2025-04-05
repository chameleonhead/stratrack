import OperandSelector from "./OperandSelector";
import { Operand } from "../types";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { VariableProvider } from "./VariableProvider";

const meta: Meta<typeof OperandSelector> = {
  component: OperandSelector,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof OperandSelector>;

export const Default: Story = {
  args: {
    value: {
      type: "price",
      source: "close",
    },
  } satisfies { value: Operand },
};

export const PriceOperand: Story = {
  args: {
    value: {
      type: "price",
      source: "high",
    },
  } satisfies { value: Operand },
};

export const NumberOperand: Story = {
  args: {
    value: {
      type: "number",
      value: 100,
    },
  } satisfies { value: Operand },
};

export const VariablesOperand: Story = {
  args: {
    value: {
      type: "variable",
      name: "value1",
    },
  } satisfies { value: Operand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          { name: "value1", expression: { type: "number", value: 1000 } },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
};

export const VariablesOperandWithDescription: Story = {
  args: {
    value: {
      type: "variable",
      name: "value1",
    },
  } satisfies { value: Operand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          {
            name: "value1",
            expression: { type: "number", value: 1000 },
            description: "テスト変数",
          },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
};

export const IndicatorOperand: Story = {
  args: {
    value: {
      type: "indicator",
      name: "",
    },
  } satisfies { value: Operand },
};

export const IndicatorOperand_SMA: Story = {
  args: {
    value: {
      type: "indicator",
      name: "SMA",
      source: "close",
      params: {
        period: 14,
      },
    },
  } satisfies { value: Operand },
};

export const IndicatorOperand_RSI: Story = {
  args: {
    value: {
      type: "indicator",
      name: "RSI",
      source: "close",
      params: {
        period: 14,
      },
    },
  } satisfies { value: Operand },
};

export const IndicatorOperand_Donchian: Story = {
  args: {
    value: {
      type: "indicator",
      name: "Donchian",
      params: {
        period: 20,
      },
    },
  } satisfies { value: Operand },
};
