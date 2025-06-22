import { fn, userEvent, within, expect } from "storybook/test";
import Select from "./Select";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Select> = {
  component: Select,
  args: {
    onChange: fn(),
    options: [
      { value: "jpy", label: "円" },
      { value: "usd", label: "ドル" },
      { value: "eur", label: "ユーロ" },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Basic: Story = {
  args: {
    label: "通貨",
    placeholder: "通貨を選択してください",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox"), "usd");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  args: {
    label: "支払い方法",
    value: "card",
    options: [
      { value: "cash", label: "現金" },
      { value: "card", label: "クレジットカード" },
      { value: "bank", label: "銀行振込" },
    ],
  },
};

export const WithError: Story = {
  args: {
    label: "プラン",
    placeholder: "プランを選択",
    required: true,
    error: "プランを選択してください",
  },
};

export const FullWidth: Story = {
  args: {
    label: "通貨",
    placeholder: "通貨を選択してください",
    fullWidth: true,
  },
};
