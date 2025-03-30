import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Input from './Input';

const meta = {
  component: Input,
  args: { onChange: fn() },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Input',
    name: 'input-name',
  },
};
