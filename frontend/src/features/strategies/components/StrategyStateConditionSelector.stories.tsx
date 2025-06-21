import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import StrategyStateConditionSelector from "./StrategyStateConditionSelector";
import VariableProvider from "./VariableProvider";

const meta = {
  component: StrategyStateConditionSelector,
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
} satisfies Meta<typeof StrategyStateConditionSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
