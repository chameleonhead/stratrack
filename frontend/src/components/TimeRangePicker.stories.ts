import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import TimeRangePicker from './TimeRangePicker';

const meta = {
  component: TimeRangePicker,
  args: { onChange: fn() },
} satisfies Meta<typeof TimeRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'TimeRangePicker',
    name: 'TimeRangePicker-name',
  },
};
