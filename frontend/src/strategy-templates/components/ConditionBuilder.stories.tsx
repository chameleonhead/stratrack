import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ConditionBuilder from "./ConditionBuilder";

const meta = {
  component: ConditionBuilder,
  args: { onChange: fn() },
} satisfies Meta<typeof ConditionBuilder>;

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
        left: {
          type: "indicator",
          name: "sma",
          params: { period: 14 },
          source: "close",
        },
        right: { type: "number", value: 0 },
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
        left: { type: "number", value: 0 },
        right: { type: "number", value: 0 },
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
        left: { type: "number", value: 0 },
        right: { type: "number", value: 0 },
      },
    ],
  },
};
