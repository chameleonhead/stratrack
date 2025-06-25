import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import TimeframeEditor from "./TimeframeEditor";
import VariableProvider from "./VariableProvider";

const meta = {
  component: TimeframeEditor,
  args: {
    onChange: fn(),
    label: "時間足",
  },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          { name: "tfVar", dataType: "timeframe", expression: { type: "constant", value: 0 } },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
} satisfies Meta<typeof TimeframeEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Constant: Story = {
  args: {
    value: { type: "constant", value: "1h" },
  },
};

export const Variable: Story = {
  args: {
    value: { type: "variable", name: "tfVar" },
  },
};
