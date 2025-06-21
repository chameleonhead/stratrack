import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import StrategyConditionBuilder from "./StrategyConditionBuilder";
import VariableProvider from "./VariableProvider";

const meta = {
  component: StrategyConditionBuilder,
  args: { onChange: fn() },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[{ name: "var1", expression: { type: "scalar_price", source: "open" } }]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
} satisfies Meta<typeof StrategyConditionBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
