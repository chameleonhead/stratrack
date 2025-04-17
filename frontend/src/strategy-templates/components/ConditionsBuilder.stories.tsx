import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ConditionsBuilder from "./ConditionsBuilder";

const meta = {
  component: ConditionsBuilder,
  args: { onChange: fn() },
} satisfies Meta<typeof ConditionsBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: [],
  },
};

export const Comparison: Story = {
  args: {
    value: [
      {
        type: "comparison",
        operator: ">",
        left: { type: "constant", value: 100 },
        right: { type: "constant", value: 300 },
      },
    ],
  },
};

export const CrossOver: Story = {
  args: {
    value: [
      {
        type: "cross",
        direction: "cross_over",
        left: { type: "constant", value: 100 },
        right: { type: "constant", value: 300 },
      },
    ],
  },
};

export const CrossUnder: Story = {
  args: {
    value: [
      {
        type: "cross",
        direction: "cross_under",
        left: { type: "constant", value: 100 },
        right: { type: "constant", value: 300 },
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
          left: { type: "constant", value: 100 },
          right: { type: "constant", value: 300 },
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
        length: 12,
        operand: { type: "variable", name: "", valueType: "array" },
      },
    ],
  },
};
