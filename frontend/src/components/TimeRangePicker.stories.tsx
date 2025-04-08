import { useState } from "react";
import TimeRangePicker from "./TimeRangePicker";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof TimeRangePicker> = {
  component: TimeRangePicker,
};

export default meta;

type Story = StoryObj<typeof TimeRangePicker>;

export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [range, setRange] = useState({ start: "", end: "" });
    return (
      <TimeRangePicker label="営業時間" value={range} onChange={setRange} />
    );
  },
};

export const WithDefaultValue: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [range, setRange] = useState({ start: "09:00", end: "17:00" });
    return (
      <TimeRangePicker label="勤務時間" value={range} onChange={setRange} />
    );
  },
};

export const WithError: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [range, setRange] = useState({ start: "", end: "" });
    return (
      <TimeRangePicker
        label="予約枠"
        value={range}
        onChange={setRange}
        required
        error={{
          start: !range.start ? "開始時間を入力してください" : "",
          end: !range.end ? "終了時間を入力してください" : "",
        }}
      />
    );
  },
};
