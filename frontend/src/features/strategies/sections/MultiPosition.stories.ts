import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

import MultiPosition from "./MultiPosition";

const meta = {
  component: MultiPosition,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof MultiPosition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("複数通貨の同時取引を許可"));
    await expect(args.onChange).toHaveBeenCalled();
  },
};
