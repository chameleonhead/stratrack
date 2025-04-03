import { useState } from "react";
import TimePicker from "./TimePicker";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof TimePicker> = {
  component: TimePicker,
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("");
    return <TimePicker label="開始時間" value={value} onChange={setValue} />;
  },
};

export const WithDefaultValue: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("13:30");
    return <TimePicker label="昼食の時間" value={value} onChange={setValue} />;
  },
};

export const WithError: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("");
    return (
      <TimePicker
        label="予約時間"
        value={value}
        onChange={setValue}
        required
        error={value ? undefined : "時間を入力してください"}
      />
    );
  },
};
