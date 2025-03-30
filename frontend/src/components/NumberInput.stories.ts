import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import NumberInput from './NumberInput';

const meta = {
  component: NumberInput,
  args: { onChange: fn() },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'NumberInput',
    name: 'number-input-name',
  },
};
