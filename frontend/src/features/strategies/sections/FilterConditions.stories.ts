import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import FilterConditions from "./FilterConditions";

const meta = {
  component: FilterConditions,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof FilterConditions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("トレンド時のみ"));
    await expect(args.onChange).toHaveBeenCalled();
  },
};
