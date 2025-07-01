import type { Meta, StoryObj } from "@storybook/react-vite";
import LineChart from "./LineChart";

const meta: Meta<typeof LineChart> = {
  component: LineChart,
};
export default meta;

type Story = StoryObj<typeof LineChart>;

export const Default: Story = {
  args: {
    width: 300,
    height: 150,
    data: [
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 1.5 },
      { x: 3, y: 3 },
    ],
  },
};
