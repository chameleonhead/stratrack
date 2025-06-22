import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import TimingControl from "./TimingControl";

const meta = {
  component: TimingControl,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof TimingControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
