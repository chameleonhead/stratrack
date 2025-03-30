import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Checkbox from './Checkbox';

const meta = {
  component: Checkbox,
  args: { onChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Checkbox',
    name: 'checkboxx-input-name',
  },
};
