import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import MultiPosition from "./MultiPosition";

const meta = {
  component: MultiPosition,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof MultiPosition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
