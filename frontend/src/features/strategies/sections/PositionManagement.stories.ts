import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import PositionManagement from "./PositionManagement";

const meta = {
  component: PositionManagement,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof PositionManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("テイクプロフィット（pips）"), "10");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
