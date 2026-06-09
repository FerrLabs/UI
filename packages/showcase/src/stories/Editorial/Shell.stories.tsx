import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Shell, type NavGroup } from '@ferrlabs/ui-react/react';

const meta: Meta<typeof Shell> = {
  title: 'Layout/Shell',
  component: Shell,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Shell>;

const Icon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d={d}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ICONS = {
  overview: 'M3 12h7V3H3v9zm11 9h7v-9h-7v9zm0-18v6h7V3h-7zM3 21h7v-6H3v6z',
  members: 'M12 12c2.5 0 4-2 4-4s-1.5-4-4-4-4 2-4 4 1.5 4 4 4zM4 20c0-3 4-5 8-5s8 2 8 5',
  billing: 'M3 9h18M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  audit: 'M9 12h6m-6 4h6m-9-9h12v14H6V7zm3-4h6v4H9V3z',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-12v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.5 8.5 2.2 2.2',
};

const sections: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: <Icon d={ICONS.overview} />,
        href: '/overview',
        badge: null,
      },
      {
        id: 'members',
        label: 'Members',
        icon: <Icon d={ICONS.members} />,
        href: '/members',
        badge: 12,
      },
      {
        id: 'audit',
        label: 'Audit log',
        icon: <Icon d={ICONS.audit} />,
        href: '/audit',
        badge: null,
      },
    ],
  },
  {
    title: 'Org',
    items: [
      {
        id: 'billing',
        label: 'Billing',
        icon: <Icon d={ICONS.billing} />,
        href: '/billing',
        badge: '!',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Icon d={ICONS.settings} />,
        href: '/settings',
        badge: null,
      },
    ],
  },
];

function ShellDemo({
  product,
  accent,
  productName,
}: {
  product: 'ferrflow' | 'ferrvault' | 'ferrtrack' | 'ferrgrowth' | 'ferrfleet' | 'ferrlabs';
  accent: string;
  productName: string;
}) {
  const [path, setPath] = useState('/overview');
  const active = sections.flatMap((s) => s.items).find((i) => i.href === path);
  return (
    <div style={{ height: '600px' }}>
      <Shell
        product={product}
        productName={productName}
        marketingHref={`https://${product}.com`}
        accent={accent}
        sections={sections}
        currentPath={path}
        onNavigate={(href) => setPath(href)}
      >
        <main style={{ padding: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, margin: 0, fontSize: 32 }}>
            {active?.label ?? 'Overview'}
          </h1>
          <p style={{ color: 'var(--color-fg-2)', marginTop: 12 }}>
            Body content. The Shell handles sidebar (collapsible), topbar, and brand mark.
          </p>
        </main>
      </Shell>
    </div>
  );
}

export const FerrFlow: Story = {
  render: () => <ShellDemo product="ferrflow" productName="FerrFlow" accent="#e8733a" />,
};

export const FerrVault: Story = {
  render: () => <ShellDemo product="ferrvault" productName="FerrVault" accent="#10b981" />,
};

export const FerrTrack: Story = {
  render: () => <ShellDemo product="ferrtrack" productName="FerrTrack" accent="#6366f1" />,
};

export const WithActions: Story = {
  render: () => {
    const [path, setPath] = useState('/overview');
    return (
      <div style={{ height: '600px' }}>
        <Shell
          product="ferrtrack"
          productName="FerrTrack"
          marketingHref="https://ferrtrack.com"
          accent="#6366f1"
          sections={sections}
          currentPath={path}
          onNavigate={(href) => setPath(href)}
          onSearch={() => alert('open command palette')}
          actions={[
            {
              id: 'new-issue',
              label: 'New issue',
              shortcut: 'C',
              onClick: () => alert('create issue'),
            },
            {
              id: 'new-project',
              label: 'New project',
              variant: 'ghost',
              onClick: () => alert('create project'),
            },
          ]}
          userMenu={{
            name: 'Bryan',
            email: 'bryan@ferrlabs.com',
            items: [
              { label: 'Profile', href: '#profile', icon: '◯' },
              { label: 'Sign out', onClick: () => alert('signed out'), danger: true },
            ],
          }}
        >
          <main style={{ padding: 32 }}>
            <h1
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 900, margin: 0, fontSize: 32 }}
            >
              Topbar with actions
            </h1>
            <p style={{ color: 'var(--color-fg-2)', marginTop: 12 }}>
              Two configurable actions in the topbar — first one defaults to <code>primary</code>,
              the rest default to <code>ghost</code>. Optional <code>shortcut</code> renders inside
              a kbd tag (you bind the keyboard event).
            </p>
          </main>
        </Shell>
      </div>
    );
  },
};
