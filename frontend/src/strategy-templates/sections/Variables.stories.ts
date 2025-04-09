import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Variables from "./Variables";

const meta = {
  component: Variables,
  args: { onClick: fn() },
} satisfies Meta<typeof Variables>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
