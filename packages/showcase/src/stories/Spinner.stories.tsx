import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '@ferrlabs/ui/primitives';

const meta: Meta<typeof Spinner> = {
  title: 'Data Display/Spinner',
  component: Spinner,
  args: { size: 'md', color: 'accent' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    color: { control: 'inline-radio', options: ['accent', 'current', 'slate'] },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner color="accent" />
      <Spinner color="slate" />
      <span className="text-emerald-500">
        <Spinner color="current" />
      </span>
    </div>
  ),
};
