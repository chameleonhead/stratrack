import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import ExitLogic from "./ExitLogic";

const meta = {
  component: ExitLogic,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof ExitLogic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
