import type { Meta, StoryObj } from '@storybook/react';
import { Badge, Button, PageHeader } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  decorators: [
    (Story) => (
      <div className="w-[960px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Members',
    description:
      'Manage who has access to this organization, their roles, and audit their activity.',
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: 'Acme Inc.',
    description: 'Org owned by Ada Lovelace · created May 2026 · 12 members.',
    breadcrumbs: [
      { label: 'FerrLabs', href: '/' },
      { label: 'Organizations', href: '/orgs' },
      { label: 'Acme Inc.' },
    ],
  },
};

export const WithActions: Story = {
  args: {
    title: 'API tokens',
    description: 'Long-lived credentials for CI and scripted access.',
    actions: (
      <>
        <Button variant="ghost">Revoke all</Button>
        <Button>Create token</Button>
      </>
    ),
  },
};

export const Full: Story = {
  args: {
    title: 'Billing',
    description: '€348 / month across 3 active subscriptions. Invoice on the 1st of every month.',
    breadcrumbs: [{ label: 'Acme Inc.', href: '/orgs/acme' }, { label: 'Billing' }],
    badge: (
      <Badge variant="success" dot>
        Healthy
      </Badge>
    ),
    actions: (
      <>
        <Button variant="ghost">Download invoices</Button>
        <Button>Update payment</Button>
      </>
    ),
  },
};
