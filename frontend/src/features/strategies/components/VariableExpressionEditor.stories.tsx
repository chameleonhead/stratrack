import VariableExpressionEditor from "./VariableExpressionEditor";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";
import VariableProvider from "./VariableProvider";
import { ConditionOperand } from "../../../codegen/dsl/common";

const meta: Meta<typeof VariableExpressionEditor> = {
  component: VariableExpressionEditor,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof VariableExpressionEditor>;

export const ConstantOperand: Story = {
  args: {
    value: {
      type: "constant",
      value: 100,
    },
  } satisfies { value: ConditionOperand },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("値"), "1");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const VariablesOperand: Story = {
  args: {
    value: {
      type: "bar_shift",
      source: {
        type: "variable",
        name: "value1",
      },
    },
  } satisfies { value: ConditionOperand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          {
            name: "value1",
            expression: { type: "scalar_price", source: "open" },
          },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
};

export const VariablesOperandWithDescription: Story = {
  args: {
    value: {
      type: "bar_shift",
      source: {
        type: "variable",
        name: "value1",
      },
    },
  } satisfies { value: ConditionOperand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          {
            name: "value1",
            expression: { type: "scalar_price", source: "open" },
            description: "テスト変数",
          },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
};
