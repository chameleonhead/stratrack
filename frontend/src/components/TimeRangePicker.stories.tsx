import TimeRangePicker from "./TimeRangePicker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole("textbox");
    await userEvent.type(inputs[0], "09:00");
    await userEvent.type(inputs[1], "17:00");
    await expect(args.onChange).toHaveBeenCalled();
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
