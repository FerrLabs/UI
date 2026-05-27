import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, SidebarItem, SidebarSection } from '@ferrlabs/ui/primitives';
import {
  AsyncOrgSelect,
  BrandDropdown,
  EntitySwitcher,
  Icon,
  LogoMark,
  OrgChip,
  type AsyncOrgOption,
  type EntitySwitcherItem,
  type OrgChipItem,
} from '@ferrlabs/ui/react';

const meta: Meta = {
  title: 'App/EntitySettings (Sidebar + AsyncOrgSelect)',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

const ORGS: OrgChipItem[] = [
  { id: 'acme', name: 'Acme Corp', meta: '3 members' },
  { id: 'personal', name: 'Personal' },
];

const VAULT_ITEMS: EntitySwitcherItem[] = [
  {
    id: 'stripe',
    label: 'stripe-keys',
    icon: (
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: 'rgba(16,185,129,0.12)',
          color: '#10b981',
          display: 'grid',
          placeItems: 'center',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        V
      </span>
    ),
    meta: <span>13 secrets · prod</span>,
  },
];

function fakeLoadOrgs(
  opts: { delayMs?: number; fail?: boolean } = {},
): () => Promise<AsyncOrgOption[]> {
  return () =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        if (opts.fail) {
          reject(new Error('network timeout'));
        } else {
          resolve([
            { id: 'acme', name: 'Acme Corp', meta: '3 members', role: 'admin' },
            { id: 'personal', name: 'Personal', meta: 'just you', role: 'admin' },
            {
              id: 'lumen-labs',
              name: 'Lumen Labs',
              meta: '6 members · viewer',
              role: 'viewer',
            },
            {
              id: 'odyssey',
              name: 'Odyssey Industries',
              meta: '38 members · member',
              role: 'member',
            },
          ]);
        }
      }, opts.delayMs ?? 600),
    );
}

/* ----------------- Sidebar with admin entity-settings group ---------------- */

export const FerrVaultSidebarWithSettings: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState('secrets');
    const [changeOrgOpen, setChangeOrgOpen] = useState(false);
    const accent = '#10b981';
    const isAdmin = true;
    const vaultSlug = 'stripe-keys';

    return (
      <div style={{ display: 'flex', minHeight: 700, background: 'var(--color-paper, #fafaf9)' }}>
        <Sidebar
          brand={
            <BrandDropdown current="ferrvault" collapsed={collapsed}>
              <ProductBrand collapsed={collapsed} />
            </BrandDropdown>
          }
          projectSlot={(c) => (
            <>
              <OrgChip current={ORGS[0]!} orgs={ORGS} collapsed={c} onSelect={() => undefined} />
              <EntitySwitcher
                kind="Vault"
                current={VAULT_ITEMS[0]!}
                items={VAULT_ITEMS}
                onSelect={() => undefined}
                collapsed={c}
              />
            </>
          )}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        >
          <SidebarSection collapsed={collapsed}>
            <SidebarItem
              icon={<Icon name="secrets" />}
              label="Secrets"
              href="/secrets"
              active={active === 'secrets'}
              onClick={() => setActive('secrets')}
              collapsed={collapsed}
              accent={accent}
            />
            <SidebarItem
              icon={<Icon name="environments" />}
              label="Environments"
              href="/envs"
              active={active === 'envs'}
              onClick={() => setActive('envs')}
              collapsed={collapsed}
              accent={accent}
            />
          </SidebarSection>

          {/* Entity Settings group — only renders when a vault is selected. */}
          <SidebarSection title={`${vaultSlug} settings`} collapsed={collapsed}>
            <SidebarItem
              icon={<Icon name="auditLog" />}
              label="General"
              href={`/vaults/${vaultSlug}/settings`}
              active={active === 'settings-general'}
              onClick={() => setActive('settings-general')}
              collapsed={collapsed}
              accent={accent}
            />
            <SidebarItem
              icon={<Icon name="shield" />}
              label="Members"
              href={`/vaults/${vaultSlug}/members`}
              active={active === 'settings-members'}
              onClick={() => setActive('settings-members')}
              collapsed={collapsed}
              accent={accent}
            />
            {/* NEW NavItem flag: onClick instead of href (opens a modal) + disabled for non-admin */}
            <SidebarItem
              icon={<Icon name="environments" />}
              label="Change organization"
              onClick={() => setChangeOrgOpen(true)}
              disabled={!isAdmin}
              collapsed={collapsed}
              accent={accent}
            />
            {/* NEW NavItem flag: danger */}
            <SidebarItem
              icon={<Icon name="kms" />}
              label="Delete vault"
              onClick={() => alert('confirm delete?')}
              danger
              disabled={!isAdmin}
              collapsed={collapsed}
              accent={accent}
            />
          </SidebarSection>
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
            Entity settings pattern
          </h1>
          <p style={{ marginTop: 8, color: 'var(--color-ink-2)', fontSize: 15, maxWidth: 640 }}>
            New <code>SidebarItem</code> flags: <code>onClick</code> (modal trigger, no href),{' '}
            <code>danger</code> (red accent), <code>disabled</code> (greyed + un-clickable for
            non-admins). Combine to build the "Settings" group at the bottom of the sidebar when an
            entity is selected.
          </p>

          {changeOrgOpen ? (
            <ChangeOrgModal onClose={() => setChangeOrgOpen(false)} />
          ) : (
            <p style={{ marginTop: 24, color: 'var(--color-ink-3)' }}>
              Click <strong>Change organization</strong> in the sidebar to open the AsyncOrgSelect
              demo.
            </p>
          )}
        </main>
      </div>
    );
  },
};

/* --------------------------- AsyncOrgSelect demo --------------------------- */

export const AsyncOrgSelectLoading: Story = {
  parameters: { layout: 'centered' },
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div style={{ width: 360, padding: 24 }}>
        <p style={{ fontSize: 13, marginBottom: 12 }}>600ms delay then 4 orgs:</p>
        <AsyncOrgSelect loadOrgs={fakeLoadOrgs()} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const AsyncOrgSelectAdminOnly: Story = {
  parameters: { layout: 'centered' },
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div style={{ width: 360, padding: 24 }}>
        <p style={{ fontSize: 13, marginBottom: 12 }}>
          Same 4 orgs but <code>adminOnly</code> filters to 2:
        </p>
        <AsyncOrgSelect loadOrgs={fakeLoadOrgs()} value={value} onChange={setValue} adminOnly />
      </div>
    );
  },
};

export const AsyncOrgSelectError: Story = {
  parameters: { layout: 'centered' },
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div style={{ width: 360, padding: 24 }}>
        <p style={{ fontSize: 13, marginBottom: 12 }}>Load fails after 600ms:</p>
        <AsyncOrgSelect loadOrgs={fakeLoadOrgs({ fail: true })} value={value} onChange={setValue} />
      </div>
    );
  },
};

/* ------------------------ helpers ------------------------ */

function ChangeOrgModal({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = useState<string | null>(null);
  return (
    <div
      style={{
        marginTop: 24,
        padding: 24,
        background: 'var(--color-card, #fff)',
        border: '1px solid var(--color-rule)',
        borderRadius: 12,
        maxWidth: 480,
      }}
    >
      <h2 style={{ font: '600 18px/1.2 var(--font-display)', margin: '0 0 10px' }}>
        Move vault to another organization
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-ink-2)' }}>
        Only orgs where you're an admin appear in the list.
      </p>
      <AsyncOrgSelect
        loadOrgs={fakeLoadOrgs()}
        value={target}
        onChange={setTarget}
        adminOnly
        placeholder="Search organizations…"
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '7px 14px',
            background: 'transparent',
            border: '1px solid var(--color-rule)',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!target}
          onClick={onClose}
          style={{
            padding: '7px 14px',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            cursor: target ? 'pointer' : 'not-allowed',
            opacity: target ? 1 : 0.5,
          }}
        >
          Move vault
        </button>
      </div>
    </div>
  );
}

function ProductBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <>
      <LogoMark product="ferrvault" accent="#10b981" size={28} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1.1,
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
            color: 'var(--color-ink)',
          }}
        >
          ferrvault
        </span>
      </div>
    </>
  );
}
