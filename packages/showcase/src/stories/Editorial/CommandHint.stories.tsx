import type { Meta, StoryObj } from '@storybook/react';
import { CommandHint } from '@ferrlabs/ui/react';

const meta: Meta<typeof CommandHint> = {
  title: 'Actions/CommandHint',
  component: CommandHint,
};

export default meta;
type Story = StoryObj<typeof CommandHint>;

export const Default: Story = {};
export const CustomShortcut: Story = { args: { shortcut: '⌘K', label: 'Search' } };
export const Slash: Story = { args: { shortcut: '/', label: 'Quick action' } };
