import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import VariableProvider from "./VariableProvider";

const meta = {
  component: VariableProvider,
  args: {
    variables: [{ name: "var1", expression: { type: "constant", value: 1 } }],
    children: <div>content</div>,
  },
} satisfies Meta<typeof VariableProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("content")).toBeInTheDocument();
  },
};
