import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Select from './Select';

const meta = {
  component: Select,
  args: { onChange: fn() },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Select',
    name: 'select-name',
  },
};
