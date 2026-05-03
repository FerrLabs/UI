import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Divider> = {
  title: 'Layout/Divider',
  component: Divider,
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm text-slate-600">
      <p>First section.</p>
      <Divider />
      <p>Second section, after a divider.</p>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm text-slate-600">
      <p>Sign in with Google or GitHub above.</p>
      <Divider label="or with email" />
      <p>Email + password form below.</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-3 text-sm h-10">
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Middle</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};
