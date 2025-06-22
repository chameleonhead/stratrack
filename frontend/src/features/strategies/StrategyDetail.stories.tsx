import type { Meta, StoryObj } from "@storybook/react-vite";
import StrategyDetail from "./StrategyDetail";

const meta = {
  component: StrategyDetail,
  args: {
    strategy: {
      id: "1",
      name: "Sample Strategy",
      description: "Example description",
      tags: ["tag1", "tag2"],
      template: { foo: "bar" },
      generatedCode: "print('hello')",
      createdAt: "",
      updatedAt: "",
    },
  },
} satisfies Meta<typeof StrategyDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
