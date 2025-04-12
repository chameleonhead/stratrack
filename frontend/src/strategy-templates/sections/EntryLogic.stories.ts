import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import EntryLogic from "./EntryLogic";

const meta = {
  component: EntryLogic,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof EntryLogic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
