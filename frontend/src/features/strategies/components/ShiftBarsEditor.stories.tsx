import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";
import ShiftBarsEditor from "./ShiftBarsEditor";
import VariableProvider from "./VariableProvider";

const meta = {
  component: ShiftBarsEditor,
  args: {
    onChange: fn(),
    label: "シフト",
  },
  decorators: [
    (story) => (
      <VariableProvider variables={[{ name: "var1", expression: { type: "constant", value: 1 } }]}>
        {story()}
      </VariableProvider>
    ),
  ],
} satisfies Meta<typeof ShiftBarsEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Constant: Story = {
  args: {
    value: { type: "constant", value: 5 },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("シフト"), "variable");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Variable: Story = {
  args: {
    value: { type: "variable", name: "var1" },
  },
};
