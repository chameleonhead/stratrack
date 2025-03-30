import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import CreateStrategyTemplateForm from './CreateStrategyTemplateForm';

const meta = {
  component: CreateStrategyTemplateForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof CreateStrategyTemplateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    primary: true,
    label: 'CreateStrategyTemplateForm',
  },
};
