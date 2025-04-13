import CodeEditor from "./CodeEditor";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof CodeEditor> = {
  component: CodeEditor,
};

export default meta;

type Story = StoryObj<typeof CodeEditor>;

export const Editable: Story = {
  args: {
    value: 'def greet(name):\n    print(f"Hello, {name}")',
  },
};

export const ReadOnly: Story = {
  args: {
    value: "import math\nprint(math.pi)",
    readOnly: true,
  },
};
