import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '@ferrlabs/ui-react';

const meta: Meta<typeof Avatar> = {
  title: 'Editorial/Avatar',
  component: Avatar,
  args: { name: 'Ada Lovelace', size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {};
export const WithImage: Story = {
  args: { src: 'https://i.pravatar.cc/96?u=ada', size: 'lg' },
};
export const FallbackOnError: Story = {
  args: { src: 'https://example.invalid/missing.jpg', size: 'lg' },
};
export const Square: Story = { args: { shape: 'square', size: 'lg' } };
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      <Avatar name="Ada Lovelace" size="xs" />
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Ada Lovelace" size="lg" />
      <Avatar name="Ada Lovelace" size="xl" />
    </div>
  ),
};
export const AccentColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Avatar name="Ada Lovelace" accent="var(--color-ferrflow-orange)" size="lg" />
      <Avatar name="Linus Torvalds" accent="var(--color-ferrvault-emerald)" size="lg" />
      <Avatar name="Margaret Hamilton" accent="var(--color-ferrtrack-indigo)" size="lg" />
      <Avatar name="Grace Hopper" accent="var(--color-ferrgrowth-violet)" size="lg" />
      <Avatar name="Alan Turing" accent="var(--color-ferrfleet-amber)" size="lg" />
    </div>
  ),
};
export const Stack: Story = {
  render: () => (
    <div style={{ display: 'flex' }}>
      {['Ada Lovelace', 'Linus Torvalds', 'Margaret Hamilton', 'Grace Hopper'].map((n) => (
        <Avatar key={n} name={n} size="md" accent="var(--color-rule-strong)" />
      ))}
    </div>
  ),
};
