import type { Meta, StoryObj } from '@storybook/react';
import { Banner } from '@ferrlabs/ui-primitives';
import { Button } from '@ferrlabs/ui-react';

const meta: Meta<typeof Banner> = {
  title: 'Primitives/Banner',
  component: Banner,
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'New release',
    children: 'FerrFlow v4.2 is out — see changelog for what changed.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Subscription activated',
    children: 'Your FerrTrack subscription is active. Trial 14 days started today.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Trial ending soon',
    children: '3 days left on FerrVault. Add a payment method to keep it active.',
    action: <Button variant="ghost">Add card</Button>,
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Payment failed',
    children: 'We could not charge your card on file. Update payment to avoid interruption.',
    action: <Button accent="#dc2626">Update payment</Button>,
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'Heads up',
    children:
      'You can dismiss this with the × on the right. State is local — refreshing brings it back.',
    dismissible: true,
  },
};

export const NoTitle: Story = {
  args: {
    variant: 'info',
    children: 'Banner with no title — just a body message.',
  },
};
