import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import BasicInfo from "./BasicInfo";

const meta = {
  component: BasicInfo,
  args: { onClick: fn() },
} satisfies Meta<typeof BasicInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
