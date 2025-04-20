import VariableExpressionEditor from "./VariableExpressionEditor";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import VariableProvider from "./VariableProvider";
import { ConditionOperand } from "../../codegen/dsl/common";

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
      valueType: "scalar",
    },
  } satisfies { value: ConditionOperand },
};

export const VariablesOperand: Story = {
  args: {
    value: {
      type: "bar_value",
      source: {
        type: "variable",
        name: "value1",
        valueType: "bar",
      },
      valueType: "scalar",
    },
  } satisfies { value: ConditionOperand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          {
            name: "value1",
            expression: { type: "scalar_price", source: "open", valueType: "scalar" },
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
      type: "bar_value",
      source: {
        type: "variable",
        name: "value1",
        valueType: "bar",
      },
      valueType: "scalar",
    },
  } satisfies { value: ConditionOperand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          {
            name: "value1",
            expression: { type: "scalar_price", source: "open", valueType: "scalar" },
            description: "テスト変数",
          },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
};
