import { Tag } from '@ferrlabs/ui-react';
import type { Meta, StoryObj } from '@storybook/react';
import { KeyValue } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof KeyValue> = {
  title: 'Data Display/KeyValue',
  component: KeyValue,
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KeyValue>;

const subscriptionItems = [
  { label: 'Product', value: 'FerrTrack' },
  {
    label: 'Tier',
    value: (
      <Tag soft variant="accent">
        Pro
      </Tag>
    ),
  },
  {
    label: 'Status',
    value: (
      <Tag soft variant="success" dot>
        Active
      </Tag>
    ),
  },
  { label: 'Renewal', value: 'May 1, 2026', hint: 'Auto-renews unless canceled.' },
  { label: 'Members', value: '47 / 50', hint: '3 seats remaining.' },
  { label: 'Trial', value: '—' },
];

export const Horizontal: Story = {
  args: { items: subscriptionItems },
};

export const Vertical: Story = {
  args: { items: subscriptionItems, orientation: 'vertical' },
};

export const Compact: Story = {
  args: { items: subscriptionItems, density: 'compact' },
};
