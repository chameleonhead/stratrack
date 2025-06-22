import TimeRangePicker from "./TimeRangePicker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta: Meta<typeof TimeRangePicker> = {
  component: TimeRangePicker,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof TimeRangePicker>;

export const Basic: Story = {
  args: {
    label: "営業時間",
  },
};

export const Controlled: Story = {
  args: {
    label: "営業時間",
    value: { from: "09:00", to: "17:00" },
  },
};

export const WithError: Story = {
  args: {
    label: "営業時間",
    error: {
      from: "開始時間を入力してください。",
      to: "終了時間を入力してください。",
    },
  },
};

export const FullWidth: Story = {
  args: {
    label: "営業時間",
    fullWidth: true,
  },
};
