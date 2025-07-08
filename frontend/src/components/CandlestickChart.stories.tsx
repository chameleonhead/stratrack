import type { Meta, StoryObj } from "@storybook/react-vite";
import CandlestickChart from "./CandlestickChart";

const meta: Meta<typeof CandlestickChart> = {
  component: CandlestickChart,
};
export default meta;

type Story = StoryObj<typeof CandlestickChart>;

export const Default: Story = {
  args: {
    width: 300,
    height: 150,
    data: [
      { date: new Date(0), open: 1, high: 1.2, low: 0.8, close: 1.1 },
      { date: new Date(1), open: 1.1, high: 1.3, low: 1.0, close: 1.0 },
      { date: new Date(2), open: 1.0, high: 1.2, low: 0.9, close: 1.15 },
      { date: new Date(3), open: 1.15, high: 1.25, low: 1.05, close: 1.1 },
    ],
  },
};
