import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import EntryLogic from "./EntryLogic";

const meta = {
  component: EntryLogic,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof EntryLogic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole("button", { name: "条件を追加" })[0]);
    await expect(args.onChange).toHaveBeenCalled();
  },
};
