import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, SidebarItem, SidebarSection } from '@ferrlabs/ui/primitives';
import {
  BrandDropdown,
  EntitySwitcher,
  Icon,
  LogoMark,
  OrgChip,
  type EntitySwitcherItem,
  type OrgChipItem,
} from '@ferrlabs/ui/react';

const meta: Meta = {
  title: 'App/EntitySwitcher',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

function Icn({ bg, fg, char }: { bg: string; fg: string; char: string }) {
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        background: bg,
        color: fg,
        display: 'grid',
        placeItems: 'center',
        fontSize: 14,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {char}
    </span>
  );
}

const ORGS: OrgChipItem[] = [
  { id: 'acme', name: 'Acme Corp', meta: '3 members' },
  { id: 'personal', name: 'Personal' },
  { id: 'demo', name: 'Demo workspace' },
];

function ProductBrand({
  product,
  accent,
  collapsed,
}: {
  product: 'ferrflow' | 'ferrvault' | 'ferrtrack' | 'ferrgrowth' | 'ferrfleet' | 'ferrlabs';
  accent: string;
  collapsed: boolean;
}) {
  return (
    <>
      <LogoMark product={product} accent={accent} size={28} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1.1,
          minWidth: 0,
          opacity: collapsed ? 0 : 1,
          maxWidth: collapsed ? 0 : 999,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          transition: 'opacity 160ms ease, max-width 220ms ease',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
          }}
        >
          {product}
        </span>
        <span
          className="mono"
          style={{
            fontSize: 9.5,
            color: 'var(--color-ink-3)',
            letterSpacing: '0.08em',
            marginTop: 2,
          }}
        >
          by ferrlabs ↗
        </span>
      </div>
    </>
  );
}

function ChromeSlot({
  collapsed,
  kind,
  items,
  current,
  renderTrigger,
}: {
  collapsed: boolean;
  kind: string;
  items: EntitySwitcherItem[];
  current: EntitySwitcherItem;
  renderTrigger?: React.ComponentProps<typeof EntitySwitcher>['renderTrigger'];
}) {
  return (
    <>
      <OrgChip
        current={ORGS[0]!}
        orgs={ORGS}
        onSelect={() => undefined}
        onCreate={() => undefined}
        collapsed={collapsed}
      />
      <EntitySwitcher
        kind={kind}
        current={current}
        items={items}
        onSelect={() => undefined}
        onCreate={() => undefined}
        onViewAll={() => undefined}
        renderTrigger={renderTrigger}
        collapsed={collapsed}
      />
    </>
  );
}

function ProductSidebar({
  product,
  accent,
  brandKey,
  kind,
  items,
  current,
  renderTrigger,
  nav,
}: {
  product: string;
  accent: string;
  brandKey: 'ferrflow' | 'ferrvault' | 'ferrtrack' | 'ferrgrowth' | 'ferrfleet' | 'ferrlabs';
  kind: string;
  items: EntitySwitcherItem[];
  current: EntitySwitcherItem;
  renderTrigger?: React.ComponentProps<typeof EntitySwitcher>['renderTrigger'];
  nav: {
    section?: string;
    items: {
      id: string;
      label: string;
      iconName:
        | 'secrets'
        | 'environments'
        | 'rotations'
        | 'auditLog'
        | 'shield'
        | 'kms'
        | 'cli'
        | 'k8s'
        | 'ci';
    }[];
  }[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState(nav[0]?.items[0]?.id ?? '');
  return (
    <div style={{ display: 'flex', minHeight: 700, background: 'var(--color-paper, #fafaf9)' }}>
      <Sidebar
        brand={
          <BrandDropdown current={brandKey} collapsed={collapsed}>
            <ProductBrand product={brandKey} accent={accent} collapsed={collapsed} />
          </BrandDropdown>
        }
        projectSlot={(c) => (
          <ChromeSlot
            collapsed={c}
            kind={kind}
            items={items}
            current={current}
            renderTrigger={renderTrigger}
          />
        )}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      >
        {nav.map((group, gi) => (
          <SidebarSection key={gi} title={group.section} collapsed={collapsed}>
            {group.items.map((it) => (
              <SidebarItem
                key={it.id}
                icon={<Icon name={it.iconName} />}
                label={it.label}
                active={active === it.id}
                onClick={() => setActive(it.id)}
                collapsed={collapsed}
                accent={accent}
              />
            ))}
          </SidebarSection>
        ))}
      </Sidebar>
      <main style={{ flex: 1, padding: 32 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: '-0.025em',
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          {product} · {kind}: {current.label}
        </h1>
        <p style={{ marginTop: 8, color: 'var(--color-ink-2)', fontSize: 15, maxWidth: 640 }}>
          Real <code>Sidebar</code> hosting <code>OrgChip</code> +{' '}
          <code>EntitySwitcher kind=&quot;{kind}&quot;</code>. Same shape across products;{' '}
          <em>{kind}</em> is the only thing that changes per app.
        </p>
      </main>
    </div>
  );
}

const VAULT_ITEMS: EntitySwitcherItem[] = [
  {
    id: 'stripe',
    label: 'stripe-keys',
    icon: <Icn bg="rgba(16,185,129,0.12)" fg="#10b981" char="V" />,
    meta: <span>13 secrets · prod</span>,
  },
  {
    id: 'sendgrid',
    label: 'sendgrid-prod',
    icon: <Icn bg="rgba(16,185,129,0.12)" fg="#10b981" char="V" />,
    meta: <span>4 secrets · prod</span>,
  },
  {
    id: 'oauth',
    label: 'oauth-credentials',
    icon: <Icn bg="rgba(16,185,129,0.12)" fg="#10b981" char="V" />,
    meta: <span>7 secrets · prod</span>,
  },
];

const SITE_ITEMS: EntitySwitcherItem[] = [
  {
    id: 'myapp',
    label: 'myapp.com',
    icon: <Icn bg="rgba(124,58,237,0.12)" fg="#7c3aed" char="◐" />,
    meta: <span>code · v2.7.3</span>,
  },
  {
    id: 'landing',
    label: 'landing.myapp.com',
    icon: <Icn bg="rgba(124,58,237,0.12)" fg="#7c3aed" char="◐" />,
    meta: <span>visual · v1.2.0</span>,
  },
  {
    id: 'docs',
    label: 'docs.myapp.com',
    icon: <Icn bg="rgba(124,58,237,0.12)" fg="#7c3aed" char="◐" />,
    meta: <span>code · v0.5.1</span>,
  },
];

const PROJECT_ITEMS: EntitySwitcherItem[] = [
  {
    id: 'mobile',
    label: 'Mobile app',
    icon: <Icn bg="rgba(99,102,241,0.12)" fg="#6366f1" char="◆" />,
    meta: <span>acme/mobile</span>,
  },
  {
    id: 'web',
    label: 'Web app',
    icon: <Icn bg="rgba(99,102,241,0.12)" fg="#6366f1" char="◆" />,
    meta: <span>acme/web</span>,
  },
];

const WORKSPACE_ITEMS: EntitySwitcherItem[] = [
  {
    id: 'prod',
    label: 'Production agents',
    icon: <Icn bg="rgba(245,158,11,0.12)" fg="#f59e0b" char="▤" />,
    meta: <span>claude-token · 12 agents</span>,
  },
  {
    id: 'staging',
    label: 'Staging agents',
    icon: <Icn bg="rgba(245,158,11,0.12)" fg="#f59e0b" char="▤" />,
    meta: <span>claude-token · 3 agents</span>,
  },
];

export const FerrVault: Story = {
  render: () => (
    <ProductSidebar
      product="FerrVault"
      brandKey="ferrvault"
      accent="#10b981"
      kind="Vault"
      items={VAULT_ITEMS}
      current={VAULT_ITEMS[0]!}
      nav={[
        {
          items: [
            { id: 'secrets', label: 'Secrets', iconName: 'secrets' },
            { id: 'envs', label: 'Environments', iconName: 'environments' },
            { id: 'rotations', label: 'Rotations', iconName: 'rotations' },
          ],
        },
        {
          section: 'Governance',
          items: [
            { id: 'audit', label: 'Audit log', iconName: 'auditLog' },
            { id: 'access', label: 'Access policies', iconName: 'shield' },
            { id: 'keys', label: 'KMS keys', iconName: 'kms' },
          ],
        },
        {
          section: 'Connect',
          items: [
            { id: 'cli', label: 'CLI / SDK', iconName: 'cli' },
            { id: 'k8s', label: 'K8s operator', iconName: 'k8s' },
            { id: 'ci', label: 'CI integrations', iconName: 'ci' },
          ],
        },
      ]}
    />
  ),
};

export const FerrGrowth: Story = {
  render: () => (
    <ProductSidebar
      product="FerrGrowth"
      brandKey="ferrgrowth"
      accent="#7c3aed"
      kind="Site"
      items={SITE_ITEMS}
      current={SITE_ITEMS[0]!}
      nav={[
        {
          items: [
            { id: 'overview', label: 'Pages', iconName: 'secrets' },
            { id: 'releases', label: 'Releases', iconName: 'rotations' },
            { id: 'forms', label: 'Forms', iconName: 'environments' },
          ],
        },
        {
          section: 'Distribution',
          items: [
            { id: 'analytics', label: 'Analytics', iconName: 'auditLog' },
            { id: 'integrations', label: 'Integrations', iconName: 'ci' },
          ],
        },
      ]}
    />
  ),
};

export const FerrTrack: Story = {
  render: () => (
    <ProductSidebar
      product="FerrTrack"
      brandKey="ferrtrack"
      accent="#6366f1"
      kind="Project"
      items={PROJECT_ITEMS}
      current={PROJECT_ITEMS[0]!}
      nav={[
        {
          items: [
            { id: 'inbox', label: 'Inbox', iconName: 'secrets' },
            { id: 'my', label: 'My issues', iconName: 'environments' },
            { id: 'all', label: 'All issues', iconName: 'rotations' },
          ],
        },
        {
          section: 'Planning',
          items: [
            { id: 'cycles', label: 'Cycles', iconName: 'auditLog' },
            { id: 'milestones', label: 'Milestones', iconName: 'kms' },
          ],
        },
      ]}
    />
  ),
};

export const FerrFleet: Story = {
  render: () => (
    <ProductSidebar
      product="FerrFleet"
      brandKey="ferrfleet"
      accent="#f59e0b"
      kind="Workspace"
      items={WORKSPACE_ITEMS}
      current={WORKSPACE_ITEMS[0]!}
      nav={[
        {
          items: [
            { id: 'fleet', label: 'Fleet', iconName: 'secrets' },
            { id: 'catalog', label: 'Catalog', iconName: 'environments' },
            { id: 'runs', label: 'Runs', iconName: 'rotations' },
            { id: 'queue', label: 'Queue', iconName: 'auditLog' },
          ],
        },
        {
          section: 'Operate',
          items: [
            { id: 'schedules', label: 'Schedules', iconName: 'kms' },
            { id: 'spend', label: 'Spend', iconName: 'shield' },
          ],
        },
      ]}
    />
  ),
};

/**
 * Demonstrates `renderTrigger` — fully custom trigger that replaces the
 * default SiteCard. Same dropdown logic, completely different look (compact
 * gradient pill, no icon, no meta line). Use this when the chrome design
 * demands a non-card trigger.
 */
export const FerrVaultCustomTrigger: Story = {
  render: () => (
    <ProductSidebar
      product="FerrVault"
      brandKey="ferrvault"
      accent="#10b981"
      kind="Vault"
      items={VAULT_ITEMS}
      current={VAULT_ITEMS[0]!}
      renderTrigger={({ current, eyebrow, onClick }) => (
        <button
          type="button"
          onClick={onClick}
          style={{
            all: 'unset',
            cursor: 'pointer',
            margin: '8px 12px',
            padding: '10px 14px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.04))',
            border: '1px solid rgba(16,185,129,0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--color-ink, #0f172a)',
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 9.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#10b981',
              fontWeight: 700,
            }}
          >
            {eyebrow}
          </span>
          <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{current?.label ?? '—'}</span>
          <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
        </button>
      )}
      nav={[
        {
          items: [
            { id: 'secrets', label: 'Secrets', iconName: 'secrets' },
            { id: 'envs', label: 'Environments', iconName: 'environments' },
          ],
        },
      ]}
    />
  ),
};
