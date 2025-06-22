import { fn } from "storybook/test";
import NumberInput from "./NumberInput";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof NumberInput> = {
  component: NumberInput,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof NumberInput>;

export const Basic: Story = {
  args: {
    label: "数量",
    placeholder: "数値を入力",
  },
};

export const Controlled: Story = {
  args: {
    label: "ロットサイズ",
    placeholder: "例: 0.1",
    value: 0.1,
  },
};

export const WithError: Story = {
  args: {
    label: "損切り幅",
    placeholder: "pipsを入力",
    error: "このフィールドは必須です",
    required: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: "数量",
    placeholder: "数値を入力",
    fullWidth: true,
  },
};
