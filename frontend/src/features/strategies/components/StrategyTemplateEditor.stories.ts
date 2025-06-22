import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import StrategyTemplateEditor from "./StrategyTemplateEditor";

const meta = {
  component: StrategyTemplateEditor,
  args: { onChange: fn() },
} satisfies Meta<typeof StrategyTemplateEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "エントリー戦略" }));
    await expect(canvas.getByRole("tab", { name: "エントリー戦略" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  },
};
