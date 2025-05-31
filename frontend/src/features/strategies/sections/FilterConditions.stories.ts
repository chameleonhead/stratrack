import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import FilterConditions from "./FilterConditions";

const meta = {
  component: FilterConditions,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof FilterConditions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
