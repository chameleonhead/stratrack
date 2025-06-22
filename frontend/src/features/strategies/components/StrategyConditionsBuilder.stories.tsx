import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

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
} satisfies Meta<typeof StrategyConditionsBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "条件を追加" }));
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Comparison: Story = {
  args: {
    value: [
      {
        type: "comparison",
        operator: ">",
        left: { type: "constant", value: 100 },
        right: {
          type: "bar_shift",
          source: { type: "variable", name: "" },
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
        left: { type: "constant", value: 100 },
        right: { type: "variable", name: "" },
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
        consecutiveBars: 12,
        operand: { type: "variable", name: "" },
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
            type: "bar_shift",
            source: { type: "variable", name: "" },
          },
          operator: "==",
          right: { type: "constant", value: 1 },
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
              type: "bar_shift",
              source: { type: "variable", name: "" },
            },
            operator: ">=",
            right: { type: "constant", value: 1 },
          },
          {
            type: "comparison",
            left: {
              type: "bar_shift",
              source: { type: "variable", name: "" },
            },
            operator: "<=",
            right: { type: "constant", value: 2 },
          },
        ],
      },
    ],
  },
};
