import RadioGroup from "./RadioGroup";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  args: {
    onChange: fn(),
    options: [
      { label: "男", value: "male" },
      { label: "女", value: "female" },
      { label: "その他", value: "other" },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Vertical: Story = {
  args: {
    label: "性別",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("男"));
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const VerticalWithError: Story = {
  args: {
    label: "性別",
    error: "性別を選択してください",
  },
};

export const Horizontal: Story = {
  args: {
    label: "性別",
    direction: "horizontal",
    value: "male",
  },
};

export const HorizontalWithError: Story = {
  args: {
    label: "性別",
    error: "性別を選択してください",
    direction: "horizontal",
    value: "male",
  },
};

export const FullWidth: Story = {
  args: {
    label: "性別",
    fullWidth: true,
  },
};
