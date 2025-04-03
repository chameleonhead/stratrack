import { useState } from "react";
import DatePicker from "./DatePicker";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("");
    return (
      <DatePicker
        label="日付を選択"
        value={value}
        onChange={setValue}
        placeholder="YYYY-MM-DD"
      />
    );
  },
};

export const WithDefaultValue: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("2025-04-01");
    return (
      <DatePicker
        label="出発日"
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("");
    return (
      <DatePicker
        label="誕生日"
        value={value}
        onChange={setValue}
        required
        error={value ? undefined : "日付を選択してください"}
      />
    );
  },
};
