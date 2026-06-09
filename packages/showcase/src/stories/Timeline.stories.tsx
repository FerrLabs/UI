import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from '@ferrlabs/ui-react/primitives';

const meta: Meta<typeof Timeline> = {
  title: 'Data Display/Timeline',
  component: Timeline,
  decorators: [
    (Story) => (
      <div className="w-[560px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const AuditLog: Story = {
  args: {
    events: [
      {
        id: '1',
        title: 'Org created',
        description: 'Acme Inc. was created by Ada Lovelace.',
        meta: 'May 1, 14:23',
        variant: 'success',
      },
      {
        id: '2',
        title: 'FerrTrack activated',
        description: 'Pro tier · 14-day trial started.',
        meta: 'May 1, 14:25',
        variant: 'accent',
      },
      {
        id: '3',
        title: 'Member added',
        description: 'Linus Torvalds joined as Admin.',
        meta: 'May 2, 09:11',
      },
      {
        id: '4',
        title: 'Trial ending soon',
        description: '3 days left on FerrVault. Add a payment method to keep it active.',
        meta: 'May 12, 08:00',
        variant: 'warning',
      },
      {
        id: '5',
        title: 'Payment failed',
        description: 'Card on file declined. Retry scheduled in 24h.',
        meta: 'May 14, 02:14',
        variant: 'danger',
      },
    ],
  },
};

export const Minimal: Story = {
  args: {
    events: [
      { id: '1', title: 'Drafted PR' },
      { id: '2', title: 'CI green' },
      { id: '3', title: 'Reviewed by Ada' },
      { id: '4', title: 'Merged to main', variant: 'success' },
    ],
  },
};
