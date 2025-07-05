import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";
import { useRef } from "react";
import DataSourceForm, { DataSourceFormHandle } from "./DataSourceForm";

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
    await userEvent.selectOptions(canvas.getByLabelText("時間足"), "1m");
    await userEvent.selectOptions(canvas.getByLabelText("フォーマット"), "tick");
    await userEvent.selectOptions(canvas.getByLabelText("Volume"), "none");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

const ValidationDemo = (args: React.ComponentProps<typeof DataSourceForm>) => {
  const ref = useRef<DataSourceFormHandle>(null);
  return (
    <div>
      <DataSourceForm ref={ref} {...args} />
      <button type="button" onClick={() => ref.current?.validate()}>
        validate
      </button>
    </div>
  );
};

export const Validation: Story = {
  args: {},
  render: ValidationDemo,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("名称"));
    await userEvent.clear(canvas.getByLabelText("名称"));
    await userEvent.click(canvas.getByRole("button", { name: "validate" }));
    await expect(canvas.getByText("名称は必須です")).toBeInTheDocument();
  },
};
