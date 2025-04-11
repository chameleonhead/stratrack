import Button from "./Button";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

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
