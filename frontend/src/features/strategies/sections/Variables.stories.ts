import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import Variables from "./Variables";

const meta = {
  component: Variables,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof Variables>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "変数を追加" }));
    await expect(args.onChange).toHaveBeenCalled();
  },
};
