import OperandSelector from "./OperandSelector";
import { Operand } from "../types";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

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
