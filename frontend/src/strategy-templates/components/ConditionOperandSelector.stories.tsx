import OperandSelector from "./ConditionOperandSelector";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import VariableProvider from "./VariableProvider";
import { ConditionOperand } from "../../dsl/common";

const meta: Meta<typeof OperandSelector> = {
  component: OperandSelector,
  args: {
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof OperandSelector>;

export const ConstantOperand: Story = {
  args: {
    value: {
      type: "constant",
      value: 100,
    },
  } satisfies { value: ConditionOperand },
};

export const VariablesOperand: Story = {
  args: {
    value: {
      type: "variable",
      name: "value1",
      valueType: "scalar",
    },
  } satisfies { value: ConditionOperand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          { name: "value1", expression: { type: "price", source: "open", valueType: "array" } },
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
      type: "variable",
      name: "value1",
      valueType: "scalar",
    },
  } satisfies { value: ConditionOperand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          {
            name: "value1",
            expression: { type: "price", source: "open", valueType: "array" },
            description: "テスト変数",
          },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
};
