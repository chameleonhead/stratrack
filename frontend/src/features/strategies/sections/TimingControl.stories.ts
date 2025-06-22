import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import TimingControl from "./TimingControl";

const meta = {
  component: TimingControl,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof TimingControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "追加" }));
    await expect(args.onChange).toHaveBeenCalled();
  },
};
