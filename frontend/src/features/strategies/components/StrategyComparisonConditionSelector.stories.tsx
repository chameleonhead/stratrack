import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";
import StrategyComparisonConditionSelector from "./StrategyComparisonConditionSelector";
import VariableProvider from "./VariableProvider";

const meta = {
  component: StrategyComparisonConditionSelector,
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
} satisfies Meta<typeof StrategyComparisonConditionSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getAllByRole("combobox")[1], "<");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
