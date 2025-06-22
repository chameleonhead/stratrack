import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import StrategyTemplateEditor from "./StrategyTemplateEditor";

const meta = {
  component: StrategyTemplateEditor,
  args: { onChange: fn() },
} satisfies Meta<typeof StrategyTemplateEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
