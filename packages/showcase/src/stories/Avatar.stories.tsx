import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  args: { name: 'Ada Lovelace', size: 'md', shape: 'circle' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {};

export const WithImage: Story = {
  args: {
    name: 'Ada Lovelace',
    src: 'https://i.pravatar.cc/96?u=ada',
    size: 'lg',
  },
};

export const FallbackOnError: Story = {
  args: {
    name: 'Bryan Ferrando',
    src: 'https://example.invalid/missing.jpg',
    size: 'lg',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar name="Ada Lovelace" size="xs" />
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Ada Lovelace" size="lg" />
      <Avatar name="Ada Lovelace" size="xl" />
    </div>
  ),
};

export const Stack: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {['Ada Lovelace', 'Linus Torvalds', 'Margaret Hamilton', 'Grace Hopper'].map((n) => (
        <Avatar key={n} name={n} size="md" className="ring-2 ring-white" />
      ))}
      <span className="ml-3 inline-flex items-center text-xs text-slate-500">+12 more</span>
    </div>
  ),
};
