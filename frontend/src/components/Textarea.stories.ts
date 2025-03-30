import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Textarea from './Textarea';

const meta = {
  component: Textarea,
  args: { onChange: fn() },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Textarea',
    name: 'textarea-name',
  },
};
