import { useState } from "react";
import CheckboxGroup from "./CheckboxGroup";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof CheckboxGroup> = {
  component: CheckboxGroup,
};

export default meta;

type Story = StoryObj<typeof CheckboxGroup>;

const options = [
  { label: "メール通知", value: "mail" },
  { label: "チャット通知", value: "chat" },
  { label: "アプリ通知", value: "app" },
];

export const Vertical: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<string[]>(["chat"]);
    return (
      <CheckboxGroup
        label="通知設定"
        options={options}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Horizontal: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<string[]>([]);
    return (
      <CheckboxGroup
        label="通知設定"
        direction="horizontal"
        options={options}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<string[]>([]);
    return (
      <CheckboxGroup
        label="サービス選択"
        options={options}
        value={value}
        onChange={setValue}
        error="1つ以上選択してください"
      />
    );
  },
};
