import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import RiskManagement from "./RiskManagement";

const meta = {
  component: RiskManagement,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof RiskManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
