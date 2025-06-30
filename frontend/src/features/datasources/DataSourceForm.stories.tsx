import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";
import DataSourceForm from "./DataSourceForm";

const meta = {
  component: DataSourceForm,
  args: { onChange: fn() },
} satisfies Meta<typeof DataSourceForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("名称"), "test");
    await expect(args.onChange).toHaveBeenCalled();
  },
};
