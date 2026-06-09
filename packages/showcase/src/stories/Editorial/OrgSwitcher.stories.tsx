import type { Meta, StoryObj } from '@storybook/react';
import { OrgSwitcher } from '@ferrlabs/ui-react/react';

const meta: Meta<typeof OrgSwitcher> = {
  title: 'App/OrgSwitcher',
  component: OrgSwitcher,
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
type Story = StoryObj<typeof OrgSwitcher>;

function OrgAvatar({ name, accent }: { name: string; accent: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: 4,
        background: accent,
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}

const orgs = [
  {
    id: 'personal',
    label: 'Bryan · Personal',
    icon: <OrgAvatar name="B" accent="#7c3aed" />,
    searchTerms: 'personal hobby',
    meta: <span style={{ color: '#94a3b8' }}>Hobby plan · 3 members</span>,
  },
  {
    id: 'acme',
    label: 'Acme Inc.',
    icon: <OrgAvatar name="A" accent="#10b981" />,
    searchTerms: 'acme inc business',
    meta: <span style={{ color: '#94a3b8' }}>Team plan · 12 members</span>,
  },
  {
    id: 'beta',
    label: 'Beta Corp.',
    icon: <OrgAvatar name="B" accent="#f59e0b" />,
    searchTerms: 'beta corp',
    meta: <span style={{ color: '#94a3b8' }}>Pro plan · 5 members</span>,
  },
];

export const Open: Story = {
  args: {
    current: orgs[1],
    items: orgs,
    onSelect: () => undefined,
    onCreate: () => undefined,
    defaultOpen: true,
  },
};

export const Closed: Story = {
  args: {
    current: orgs[1],
    items: orgs,
    onSelect: () => undefined,
    onCreate: () => undefined,
  },
};

export const SingleOrg: Story = {
  args: {
    current: orgs[0],
    items: [orgs[0]],
    onSelect: () => undefined,
    onCreate: () => undefined,
    defaultOpen: true,
  },
};
