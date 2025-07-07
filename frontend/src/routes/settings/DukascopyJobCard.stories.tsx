import type { Meta, StoryObj } from "@storybook/react";
import { fn, within, expect } from "storybook/test";
import DukascopyJobCard, { JobState } from "./DukascopyJobCard";
import { toDateTimeLocalString } from "../../utils";

const meta = {
  component: DukascopyJobCard,
  args: {
    pair: "EURUSD",
    job: { start: toDateTimeLocalString(new Date()), running: false } as JobState,
    logs: [],
    disabled: false,
    onDateChange: fn(),
    onToggle: fn(),
  },
} satisfies Meta<typeof DukascopyJobCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("EURUSD")).toBeInTheDocument();
  },
};
