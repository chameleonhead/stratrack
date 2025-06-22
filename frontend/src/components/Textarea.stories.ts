import { fn, userEvent, within, expect } from "storybook/test";
import Textarea from "./Textarea";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Basic: Story = {
  args: {
    label: "自己紹介",
    placeholder: "あなたの自己紹介を書いてください",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText("自己紹介");
    await userEvent.type(textarea, "こんにちは");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  args: {
    label: "メモ",
    placeholder: "ここに入力",
    value: "これは既定の内容です。",
  },
};

export const WithError: Story = {
  args: {
    label: "説明",
    placeholder: "入力してください",
    error: "このフィールドは必須です",
    required: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: "説明",
    fullWidth: true,
  },
};
