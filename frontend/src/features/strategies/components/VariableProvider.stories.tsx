import type { Meta, StoryObj } from "@storybook/react-vite";
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

export const Default: Story = {};
