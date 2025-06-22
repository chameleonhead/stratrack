import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import PositionManagement from "./PositionManagement";

const meta = {
  component: PositionManagement,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof PositionManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
