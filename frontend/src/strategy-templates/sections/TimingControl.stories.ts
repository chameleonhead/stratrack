import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TimingControl from "./TimingControl";

const meta = {
  component: TimingControl,
  args: {
    onChange: fn()
  },
} satisfies Meta<typeof TimingControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
};
