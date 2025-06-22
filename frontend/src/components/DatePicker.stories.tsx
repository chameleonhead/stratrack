import DatePicker from "./DatePicker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Basic: Story = {
  args: {
    label: "日付を選択",
    placeholder: "YYYY-MM-DD",
  },
};

export const Controlled: Story = {
  args: {
    label: "出発日",
    value: "2025-04-01",
  },
};

export const WithError: Story = {
  args: {
    label: "出発日",
    required: true,
    error: "日付を選択してください",
  },
};

export const FullWidth: Story = {
  args: {
    label: "出発日",
    fullWidth: true,
  },
};
