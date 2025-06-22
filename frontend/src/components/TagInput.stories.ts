import { fn } from "storybook/test";
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
