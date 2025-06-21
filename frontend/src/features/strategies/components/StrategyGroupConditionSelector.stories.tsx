import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import StrategyGroupConditionSelector from "./StrategyGroupConditionSelector";
import VariableProvider from "./VariableProvider";

const meta = {
  component: StrategyGroupConditionSelector,
  args: { value: {}, onChange: fn() },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[{ name: "var1", expression: { type: "scalar_price", source: "open" } }]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
} satisfies Meta<typeof StrategyGroupConditionSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
