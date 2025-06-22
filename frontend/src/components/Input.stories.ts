import { fn } from "storybook/test";
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
