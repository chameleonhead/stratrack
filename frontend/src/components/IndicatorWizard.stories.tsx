import IndicatorWizard from "./IndicatorWizard";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, within, userEvent, expect } from "storybook/test";
import { useIndicatorList } from "../features/indicators/IndicatorProvider";

const meta: Meta<typeof IndicatorWizard> = {
  component: IndicatorWizard,
  args: {
    onSubmit: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof IndicatorWizard>;

export const Default: Story = {
  render: (args) => {
    const Wrapper = () => {
      const indicators = useIndicatorList().filter((i) => i.name === "moving_average");
      return <IndicatorWizard {...args} indicators={indicators} />;
    };
    return <Wrapper />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("インジケーター"), "moving_average");
    await userEvent.click(canvas.getByRole("button", { name: "次へ" }));
    await userEvent.click(canvas.getByRole("button", { name: "完了" }));
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};
