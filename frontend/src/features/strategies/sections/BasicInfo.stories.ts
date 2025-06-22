import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import BasicInfo from "./BasicInfo";

const meta = {
  component: BasicInfo,
  args: {
    value: {},
    onChange: fn(),
  },
} satisfies Meta<typeof BasicInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
