import CodeEditor from "./CodeEditor";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

const meta: Meta<typeof CodeEditor> = {
  component: CodeEditor,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof CodeEditor>;

export const Editable: Story = {
  args: {
    value: 'def greet(name):\n    print(f"Hello, {name}")',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "\nprint('done')");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: {
    value: "import math\nprint(math.pi)",
    readOnly: true,
  },
};
