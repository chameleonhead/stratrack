import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import WeekdaySelector from './WeekdaySelector';

const meta = {
  component: WeekdaySelector,
  args: { onChange: fn() },
} satisfies Meta<typeof WeekdaySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'WeekdaySelector',
    name: 'weekdayselector-name',
  },
};
