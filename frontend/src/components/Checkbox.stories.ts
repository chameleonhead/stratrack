import { fn, userEvent, within, expect } from "storybook/test";
import Checkbox from "./Checkbox";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {
  args: {
    label: "利用規約に同意する",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox"));
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  args: {
    label: "メールマガジンを購読する",
    checked: true,
  },
};

export const WithError: Story = {
  args: {
    label: "同意が必要です",
    error: "この項目は必須です",
  },
};
