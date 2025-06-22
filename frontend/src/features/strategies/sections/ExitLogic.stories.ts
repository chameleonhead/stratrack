import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import ExitLogic from "./ExitLogic";

const meta = {
  component: ExitLogic,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof ExitLogic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "条件を追加" })[0]);
    await expect(args.onChange).toHaveBeenCalled();
  },
};
