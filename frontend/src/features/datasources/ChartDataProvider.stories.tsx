import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChartDataProvider } from "./ChartDataProvider";

const meta = {
  component: ChartDataProvider,
  args: {
    dataSourceId: "",
    children: <div>ChartDataProvider</div>,
  },
} satisfies Meta<typeof ChartDataProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
