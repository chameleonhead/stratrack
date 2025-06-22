import TimePicker from "./TimePicker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta: Meta<typeof TimePicker> = {
  component: TimePicker,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

export const Basic: Story = {
  args: {
    label: "開始時間",
    placeholder: "HH:mm",
  },
};

export const Controlled: Story = {
  args: {
    label: "開始時間",
    placeholder: "HH:mm",
    value: "13:30",
  },
};

export const WithError: Story = {
  args: {
    label: "開始時間",
    required: true,
    error: "時間を入力してください",
  },
};

export const FullWidth: Story = {
  args: {
    label: "開始時間",
    fullWidth: true,
  },
};
