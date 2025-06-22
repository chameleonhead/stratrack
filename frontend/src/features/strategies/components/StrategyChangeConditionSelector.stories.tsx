import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import StrategyChangeConditionSelector from "./StrategyChangeConditionSelector";
import VariableProvider from "./VariableProvider";

const meta = {
  component: StrategyChangeConditionSelector,
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
} satisfies Meta<typeof StrategyChangeConditionSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
