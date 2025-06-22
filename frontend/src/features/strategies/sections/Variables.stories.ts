import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import Variables from "./Variables";

const meta = {
  component: Variables,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof Variables>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
