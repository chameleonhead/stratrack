import { useState } from "react";
import RadioGroup from "./RadioGroup";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

const options = [
  { label: "男", value: "male" },
  { label: "女", value: "female" },
  { label: "その他", value: "other" },
];

export const Vertical: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("male");
    return (
      <RadioGroup
        label="性別"
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
    const [value, setValue] = useState("");
    return (
      <RadioGroup
        label="性別"
        options={options}
        value={value}
        onChange={setValue}
        direction="horizontal"
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("");
    return (
      <RadioGroup
        label="性別"
        options={options}
        value={value}
        onChange={setValue}
        error="性別を選択してください"
      />
    );
  },
};
