import WeekdaySelector from "./WeekdaySelector";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta: Meta<typeof WeekdaySelector> = {
  component: WeekdaySelector,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof WeekdaySelector>;

export const Basic: Story = {
  args: {
    label: "曜日",
  },
};

export const DefaultSelected: Story = {
  args: {
    label: "曜日",
    defaultValue: ["mon", "tue", "wed", "thu", "fri"],
  },
};

export const Weekdays: Story = {
  args: {
    label: "曜日",
    weekdays: [
      { label: "月", value: "mon" },
      { label: "火", value: "tue" },
      { label: "水", value: "wed" },
      { label: "木", value: "thu" },
      { label: "金", value: "fri" },
    ],
  },
};

export const Controlled: Story = {
  args: {
    label: "曜日",
    value: ["mon", "tue"],
  },
};

export const WithError: Story = {
  args: {
    label: "曜日",
    error: "少なくとも1日選択してください",
  },
};
