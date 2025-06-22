import { fn, userEvent, within, expect } from "storybook/test";
import Input from "./Input";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Input> = {
  component: Input,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Basic: Story = {
  args: {
    label: "入力",
    placeholder: "値を入力",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("入力");
    await userEvent.type(input, "test");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  args: {
    label: "戦略名",
    placeholder: "例: ドンチャンチャンネル",
    value: "",
  },
};

export const WithError: Story = {
  args: {
    label: "戦略名",
    placeholder: "例: ドンチャンチャンネル",
    error: "このフィールドは必須です",
    required: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: "戦略名",
    placeholder: "例: ドンチャンチャンネル",
    fullWidth: true,
  },
};
