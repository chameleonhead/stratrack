import CheckboxGroup from "./CheckboxGroup";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

const meta: Meta<typeof CheckboxGroup> = {
  component: CheckboxGroup,
  args: {
    onChange: fn(),
    options: [
      { label: "メール通知", value: "mail" },
      { label: "チャット通知", value: "chat" },
      { label: "アプリ通知", value: "app" },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof CheckboxGroup>;

export const Vertical: Story = {
  args: {
    label: "通知設定",
    defaultValue: [],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("メール通知"));
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const VerticalWithError: Story = {
  args: {
    label: "通知設定",
    defaultValue: [],
    error: "1つ以上選択してください",
  },
};

export const Horizontal: Story = {
  args: {
    label: "サービス選択",
    defaultValue: [],
    direction: "horizontal",
  },
};

export const HorizontalWithError: Story = {
  args: {
    label: "サービス選択",
    defaultValue: [],
    direction: "horizontal",
    error: "1つ以上選択してください",
  },
};

export const FullWidth: Story = {
  args: {
    label: "サービス選択",
    fullWidth: true,
  },
};
