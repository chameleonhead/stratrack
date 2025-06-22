import Button from "./Button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

const meta: Meta<typeof Button> = {
  component: Button,
  args: {
    onClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "送信",
    variant: "primary",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Secondary: Story = {
  args: {
    children: "キャンセル",
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "詳細を見る",
    variant: "outline",
  },
};

export const Danger: Story = {
  args: {
    children: "削除",
    variant: "danger",
  },
};

export const Large: Story = {
  args: {
    children: "確認",
    size: "lg",
  },
};

export const Small: Story = {
  args: {
    children: "OK",
    size: "sm",
  },
};

export const Loading: Story = {
  args: {
    children: "読み込み中",
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "無効ボタン",
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: "送信",
    fullWidth: true,
  },
};
