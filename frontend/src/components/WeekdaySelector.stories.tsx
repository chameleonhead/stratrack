import { useState } from "react";
import WeekdaySelector from "./WeekdaySelector";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof WeekdaySelector> = {
  component: WeekdaySelector,
};

export default meta;

type Story = StoryObj<typeof WeekdaySelector>;

export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<string[]>([]);
    return (
      <WeekdaySelector label="定休日を選択" value={value} onChange={setValue} />
    );
  },
};

export const DefaultSelected: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<string[]>(["sat", "sun"]);
    return <WeekdaySelector label="休業日" value={value} onChange={setValue} />;
  },
};

export const WithError: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<string[]>([]);
    return (
      <WeekdaySelector
        label="出勤日"
        value={value}
        onChange={setValue}
        error={value.length === 0 ? "少なくとも1日選択してください" : undefined}
      />
    );
  },
};
