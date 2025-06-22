import TimePicker from "./TimePicker";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("開始時間");
    await userEvent.type(input, "09:00");
    await expect(args.onChange).toHaveBeenCalled();
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
