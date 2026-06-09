import type { Meta, StoryObj } from '@storybook/react';
import { SiteCard, SiteFavicon } from '@ferrlabs/ui-react/react';

const meta: Meta<typeof SiteCard> = {
  title: 'App/SiteCard',
  component: SiteCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240, background: 'var(--color-app-sidebar, #f8fafc)' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SiteCard>;

const fgMeta = (
  <>
    <span style={{ color: '#059669', fontWeight: 500 }}>live</span>
    <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>·</span>
    <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>in Acme Inc.</span>
  </>
);

export const FerrGrowthSite: Story = {
  args: {
    icon: <SiteFavicon domain="ferrlabs.com" name="ferrlabs.com" />,
    label: 'ferrlabs.com',
    meta: fgMeta,
    onClick: () => undefined,
  },
};

export const FerrGrowthDraft: Story = {
  args: {
    icon: <SiteFavicon name="Q5 launch" />,
    label: 'Q5 launch',
    meta: (
      <>
        <span style={{ color: '#d97706', fontWeight: 500 }}>draft</span>
        <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>·</span>
        <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>in Personal</span>
      </>
    ),
    onClick: () => undefined,
  },
};

export const FerrTrackWorkspace: Story = {
  args: {
    icon: <SiteFavicon name="Acme bugs" />,
    label: 'Acme bugs',
    meta: (
      <>
        <span style={{ color: '#6366f1', fontWeight: 500 }}>142 open</span>
        <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>·</span>
        <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>in Acme Inc.</span>
      </>
    ),
    onClick: () => undefined,
  },
};

export const FerrVaultVault: Story = {
  args: {
    icon: <SiteFavicon name="prod secrets" />,
    label: 'prod-secrets',
    meta: (
      <>
        <span style={{ color: '#059669', fontWeight: 500 }}>47 secrets</span>
        <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>·</span>
        <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>sealed · in Acme Inc.</span>
      </>
    ),
    onClick: () => undefined,
  },
};

export const FerrFleetAgent: Story = {
  args: {
    icon: <SiteFavicon name="deploy bot" />,
    label: 'deploy-bot',
    meta: (
      <>
        <span style={{ color: '#f59e0b', fontWeight: 500 }}>running</span>
        <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>·</span>
        <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>23 runs today · in Acme Inc.</span>
      </>
    ),
    onClick: () => undefined,
  },
};

export const AllSitesPlaceholder: Story = {
  args: {
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
    label: 'All sites',
    meta: <span style={{ color: 'var(--color-fg-3, #94a3b8)' }}>in Acme Inc.</span>,
    onClick: () => undefined,
  },
};

export const NoChevron: Story = {
  args: {
    icon: <SiteFavicon domain="stripe.com" name="stripe.com" />,
    label: 'stripe.com',
    meta: fgMeta,
    showChevron: false,
  },
};

export const NonInteractive: Story = {
  args: {
    icon: <SiteFavicon domain="vercel.com" name="vercel.com" />,
    label: 'vercel.com',
    meta: fgMeta,
  },
};
