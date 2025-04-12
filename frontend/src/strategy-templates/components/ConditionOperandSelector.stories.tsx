import OperandSelector from "./ConditionOperandSelector";
import { ConditionOperand } from "../types";

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import VariableProvider from "./VariableProvider";

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
    },
  } satisfies { value: ConditionOperand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[{ name: "value1", expression: { type: "price", source: "open" } }]}
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
    },
  } satisfies { value: ConditionOperand },
  decorators: [
    (story) => (
      <VariableProvider
        variables={[
          {
            name: "value1",
            expression: { type: "price", source: "open" },
            description: "テスト変数",
          },
        ]}
      >
        {story()}
      </VariableProvider>
    ),
  ],
};
