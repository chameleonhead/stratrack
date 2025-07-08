import type { Meta, StoryObj } from "@storybook/react-vite";
import CandlestickChart from "./CandlestickChart";

const meta: Meta<typeof CandlestickChart> = {
  component: CandlestickChart,
};
export default meta;

type Story = StoryObj<typeof CandlestickChart>;

export const Default: Story = {
  render: () => <div style={{ width: 400, height: 250 }}>CandlestickChart</div>,
};
