import type { Meta, StoryObj } from '@storybook/react';
import { Button, PageHeader, Tag } from '@ferrlabs/ui/react';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Members',
    sub: 'Manage who has access to this organization, their roles, and audit their activity.',
  },
};
export const WithEyebrow: Story = {
  args: {
    eyebrow: '№ 03 — Org settings',
    title: 'Members',
    sub: '12 members across 5 teams.',
  },
};
export const WithBreadcrumbs: Story = {
  args: {
    breadcrumbs: [
      { label: 'FerrLabs', href: '/' },
      { label: 'Acme Inc.', href: '/orgs/acme' },
      { label: 'Members' },
    ],
    title: 'Members',
    sub: '12 members across 5 teams.',
  },
};
export const WithBadge: Story = {
  args: {
    title: 'Acme Inc.',
    sub: 'Org owned by Ada Lovelace · created May 2026.',
    badge: (
      <Tag variant="success" soft>
        Active
      </Tag>
    ),
  },
};
export const WithActions: Story = {
  args: {
    eyebrow: '№ 04 — Tokens',
    title: 'API tokens',
    sub: 'Long-lived credentials for CI and scripted access.',
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
    breadcrumbs: [{ label: 'Acme Inc.', href: '/orgs/acme' }, { label: 'Billing' }],
    eyebrow: '№ 05 — Billing',
    title: 'Subscriptions',
    sub: '€348 / month across 3 active subscriptions.',
    badge: (
      <Tag variant="success" soft>
        Healthy
      </Tag>
    ),
    actions: (
      <>
        <Button variant="ghost">Download invoices</Button>
        <Button>Update payment</Button>
      </>
    ),
  },
};
