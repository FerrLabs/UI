import type { Meta, StoryObj } from '@storybook/react';
import { ProjectSwitcher, SiteFavicon } from '@ferrlabs/ui/react';

const meta: Meta<typeof ProjectSwitcher> = {
  title: 'App/ProjectSwitcher',

  component: ProjectSwitcher,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 240,
          background: 'var(--color-app-sidebar, #f8fafc)',
          padding: '12px 0',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProjectSwitcher>;

const fgItems = [
  {
    id: 'ferrlabs-com',
    label: 'ferrlabs.com',
    icon: <SiteFavicon domain="ferrlabs.com" name="ferrlabs.com" />,
    meta: <span style={{ color: '#94a3b8' }}>live · 74.2k v · in Acme</span>,
  },
  {
    id: 'ferrflow-com',
    label: 'ferrflow.com',
    icon: <SiteFavicon domain="ferrflow.com" name="ferrflow.com" />,
    meta: <span style={{ color: '#94a3b8' }}>live · 18.4k v · in Acme</span>,
  },
  {
    id: 'stripe-com',
    label: 'stripe.com',
    icon: <SiteFavicon domain="stripe.com" name="stripe.com" />,
    meta: <span style={{ color: '#94a3b8' }}>live · 9.8k v · in Personal</span>,
  },
  {
    id: 'vercel-com',
    label: 'vercel.com',
    icon: <SiteFavicon domain="vercel.com" name="vercel.com" />,
    meta: <span style={{ color: '#94a3b8' }}>live · 1.2k v · in Personal</span>,
  },
  {
    id: 'q5-launch',
    label: 'Q5 launch',
    icon: <SiteFavicon name="Q5 launch" />,
    meta: <span style={{ color: '#d97706' }}>draft · in Acme</span>,
  },
];

export const FerrGrowthOpen: Story = {
  args: {
    current: fgItems[0],
    items: fgItems,
    onSelect: () => undefined,
    onCreate: () => undefined,
    createLabel: 'Create site',
    onViewAll: () => undefined,
    viewAllLabel: 'View all sites',
    title: 'Switch site',
    searchPlaceholder: 'Search sites…',
    defaultOpen: true,
  },
};

export const FerrGrowthClosed: Story = {
  args: {
    current: fgItems[0],
    items: fgItems,
    onSelect: () => undefined,
    onCreate: () => undefined,
    onViewAll: () => undefined,
    title: 'Switch site',
  },
};

export const FerrGrowthPlaceholder: Story = {
  args: {
    current: null,
    items: fgItems,
    onSelect: () => undefined,
    onCreate: () => undefined,
    onViewAll: () => undefined,
    placeholder: {
      label: 'All sites',
      icon: (
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: 4,
            background: 'var(--color-rule, #e2e8f0)',
            color: 'var(--color-fg-2, #475569)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          ▦
        </span>
      ),
      meta: <span style={{ color: '#94a3b8' }}>in Acme</span>,
    },
    title: 'Switch site',
    defaultOpen: true,
  },
};

export const EmptyState: Story = {
  args: {
    current: null,
    items: [],
    onSelect: () => undefined,
    onCreate: () => undefined,
    placeholder: {
      label: 'No sites',
      icon: (
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: 4,
            background: 'var(--color-rule, #e2e8f0)',
            color: 'var(--color-fg-2, #475569)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          ▦
        </span>
      ),
    },
    createLabel: 'Create your first site',
    title: 'Switch site',
    defaultOpen: true,
    emptyState: 'No sites in this workspace yet',
  },
};
