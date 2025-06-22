import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import BasicInfo from "./BasicInfo";

const meta = {
  component: BasicInfo,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof BasicInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("戦略名"), "test");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
