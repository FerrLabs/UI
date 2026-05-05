import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from '@ferrlabs/ui/primitives';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [
      { label: 'FerrLabs', href: '/' },
      { label: 'Acme Inc.', href: '/orgs/acme' },
      { label: 'Members' },
    ],
  },
};

export const ChevronSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings' },
      { label: 'Telemetry' },
    ],
    separator: '›',
  },
};

export const SingleLevel: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
};

export const Long: Story = {
  args: {
    items: [
      { label: 'FerrLabs', href: '/' },
      { label: 'Organizations', href: '/orgs' },
      { label: 'Acme Inc.', href: '/orgs/acme' },
      { label: 'Subscriptions', href: '/orgs/acme/subscriptions' },
      { label: 'FerrTrack', href: '/orgs/acme/subscriptions/ferrtrack' },
      { label: 'Invoices' },
    ],
  },
};
