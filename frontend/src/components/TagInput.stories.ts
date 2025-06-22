import { fn, userEvent, within, expect } from "storybook/test";
import TagInput from "./TagInput";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TagInput> = {
  component: TagInput,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof TagInput>;

export const Basic: Story = {
  args: {
    label: "タグ",
    name: "tags",
    placeholder: "タグを追加",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "tagA{enter}");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  args: {
    label: "タグ",
    name: "tags",
    value: ["tag1", "tag2"],
    placeholder: "タグを追加",
  },
};

export const WithError: Story = {
  args: {
    label: "タグ",
    name: "tags",
    placeholder: "タグを追加",
    required: true,
    error: "タグを追加してください",
  },
};

export const FullWidth: Story = {
  args: {
    label: "タグ",
    fullWidth: true,
  },
};
