import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, SidebarItem, SidebarSection } from '@ferrlabs/ui-primitives';
import {
  BrandDropdown,
  Icon,
  LogoMark,
  OrgDropdown,
  type OrgDropdownItem,
} from '@ferrlabs/ui-react';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const DEMO_ORGS: OrgDropdownItem[] = [
  { id: 'acme', name: 'acme', meta: '14 seats · Business', accent: '#7c3aed' },
  { id: 'lumen-labs', name: 'lumen labs', meta: '6 seats · Pro', accent: '#0ea5e9' },
  { id: 'odyssey', name: 'odyssey', meta: '38 seats · Enterprise', accent: '#dc2626' },
  { id: 'soliloquy', name: 'soliloquy', meta: '2 seats · Free', accent: '#10b981' },
];

const ProductBrand = ({
  product,
  accent,
  collapsed,
}: {
  product: 'ferrflow' | 'ferrvault' | 'ferrtrack' | 'ferrgrowth' | 'ferrfleet' | 'ferrlabs';
  accent: string;
  collapsed: boolean;
}) => (
  <>
    <LogoMark product={product} accent={accent} />
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

function FerrVaultApp({ initialCollapsed = false }: { initialCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [active, setActive] = useState('secrets');
  const accent = '#10b981';
  return (
    <div style={{ display: 'flex', minHeight: 700, background: 'var(--color-paper, #fafaf9)' }}>
      <Sidebar
        brand={
          <BrandDropdown current="ferrvault" collapsed={collapsed}>
            <ProductBrand product="ferrvault" accent={accent} collapsed={collapsed} />
          </BrandDropdown>
        }
        projectSlot={
          <OrgDropdown
            current={DEMO_ORGS[0]!}
            orgs={DEMO_ORGS}
            collapsed={collapsed}
            defaultOpen
            onSelect={(id) => console.log('switch org:', id)}
            onCreate={() => console.log('create new org')}
          />
        }
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      >
        <SidebarSection collapsed={collapsed}>
          <SidebarItem
            icon={<Icon name="secrets" />}
            label="Secrets"
            badge={127}
            active={active === 'secrets'}
            onClick={() => setActive('secrets')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="environments" />}
            label="Environments"
            badge={4}
            active={active === 'envs'}
            onClick={() => setActive('envs')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="rotations" />}
            label="Rotations"
            badge={3}
            active={active === 'rotations'}
            onClick={() => setActive('rotations')}
            collapsed={collapsed}
            accent={accent}
          />
        </SidebarSection>
        <SidebarSection title="Governance" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon name="auditLog" />}
            label="Audit log"
            active={active === 'audit'}
            onClick={() => setActive('audit')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="shield" />}
            label="Access policies"
            active={active === 'access'}
            onClick={() => setActive('access')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="kms" />}
            label="KMS keys"
            active={active === 'keys'}
            onClick={() => setActive('keys')}
            collapsed={collapsed}
            accent={accent}
          />
        </SidebarSection>
        <SidebarSection title="Connect" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon name="cli" />}
            label="CLI / SDK"
            active={active === 'cli'}
            onClick={() => setActive('cli')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="k8s" />}
            label="K8s operator"
            active={active === 'k8s'}
            onClick={() => setActive('k8s')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="ci" />}
            label="CI integrations"
            active={active === 'ci'}
            onClick={() => setActive('ci')}
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
            fontSize: 36,
            letterSpacing: '-0.025em',
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          {active.charAt(0).toUpperCase() + active.slice(1)}
        </h1>
        <p
          style={{
            marginTop: 8,
            color: 'var(--color-ink-2)',
            fontSize: 15,
            maxWidth: 600,
          }}
        >
          Product app sidebar — project switcher under the brand, workspace-first sections, accent
          left bar on the active item, built-in collapse toggle. Mirrors the AppShell from the v8
          design bundle (FerrVault, FerrTrack, FerrGrowth, FerrFleet share the same chrome).
        </p>
      </main>
    </div>
  );
}

function FerrTrackApp() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('issues');
  const accent = 'var(--color-ferrtrack-indigo, #6366f1)';
  return (
    <div style={{ display: 'flex', minHeight: 700, background: 'var(--color-paper, #fafaf9)' }}>
      <Sidebar
        brand={
          <BrandDropdown current="ferrtrack" collapsed={collapsed}>
            <ProductBrand product="ferrtrack" accent={accent} collapsed={collapsed} />
          </BrandDropdown>
        }
        projectSlot={
          <OrgDropdown
            current={DEMO_ORGS[0]!}
            orgs={DEMO_ORGS}
            collapsed={collapsed}
            defaultOpen
            onSelect={(id) => console.log('switch org:', id)}
            onCreate={() => console.log('create new org')}
          />
        }
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      >
        <SidebarSection collapsed={collapsed}>
          <SidebarItem
            icon={<Icon name="issues" />}
            label="Issues"
            badge={42}
            active={active === 'issues'}
            onClick={() => setActive('issues')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="cycles" />}
            label="Cycles"
            active={active === 'cycles'}
            onClick={() => setActive('cycles')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="roadmap" />}
            label="Roadmap"
            active={active === 'roadmap'}
            onClick={() => setActive('roadmap')}
            collapsed={collapsed}
            accent={accent}
          />
        </SidebarSection>
        <SidebarSection title="Workflows" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon name="triage" />}
            label="Triage"
            badge={7}
            active={active === 'triage'}
            onClick={() => setActive('triage')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="templates" />}
            label="Templates"
            active={active === 'templates'}
            onClick={() => setActive('templates')}
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
            fontSize: 36,
            letterSpacing: '-0.025em',
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          {active.charAt(0).toUpperCase() + active.slice(1)}
        </h1>
        <p
          style={{
            marginTop: 8,
            color: 'var(--color-ink-2)',
            fontSize: 15,
            maxWidth: 600,
          }}
        >
          Same Sidebar primitive, different accent (indigo) and product context. Project switcher +
          workspace nav.
        </p>
      </main>
    </div>
  );
}

function FerrLabsAccount() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('overview');
  const accent = 'var(--color-ink, #1e293b)';
  return (
    <div style={{ display: 'flex', minHeight: 700, background: 'var(--color-paper, #fafaf9)' }}>
      <Sidebar
        brand={
          <BrandDropdown current="ferrlabs" collapsed={collapsed}>
            <ProductBrand product="ferrlabs" accent={accent} collapsed={collapsed} />
          </BrandDropdown>
        }
        projectSlot={
          <OrgDropdown
            current={DEMO_ORGS[0]!}
            orgs={DEMO_ORGS}
            collapsed={collapsed}
            defaultOpen
            onSelect={(id) => console.log('switch org:', id)}
            onCreate={() => console.log('create new org')}
          />
        }
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      >
        <SidebarSection collapsed={collapsed}>
          <SidebarItem
            icon={<Icon name="overview" />}
            label="Overview"
            active={active === 'overview'}
            onClick={() => setActive('overview')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="products" />}
            label="Products"
            badge={5}
            active={active === 'products'}
            onClick={() => setActive('products')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="usage" />}
            label="Usage"
            active={active === 'usage'}
            onClick={() => setActive('usage')}
            collapsed={collapsed}
            accent={accent}
          />
        </SidebarSection>
        <SidebarSection title="Organization" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon name="members" />}
            label="Members"
            badge={14}
            active={active === 'members'}
            onClick={() => setActive('members')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="teams" />}
            label="Teams"
            badge={4}
            active={active === 'teams'}
            onClick={() => setActive('teams')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="roles" />}
            label="Roles"
            active={active === 'roles'}
            onClick={() => setActive('roles')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="auditLog" />}
            label="Audit log"
            active={active === 'audit'}
            onClick={() => setActive('audit')}
            collapsed={collapsed}
            accent={accent}
          />
        </SidebarSection>
        <SidebarSection title="Billing" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon name="billing" />}
            label="Plan & invoices"
            active={active === 'billing'}
            onClick={() => setActive('billing')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="tax" />}
            label="Tax & legal"
            active={active === 'tax'}
            onClick={() => setActive('tax')}
            collapsed={collapsed}
            accent={accent}
          />
        </SidebarSection>
        <SidebarSection title="Security" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon name="sso" />}
            label="SSO / SAML"
            active={active === 'sso'}
            onClick={() => setActive('sso')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="tokens" />}
            label="API tokens"
            badge={7}
            active={active === 'tokens'}
            onClick={() => setActive('tokens')}
            collapsed={collapsed}
            accent={accent}
          />
          <SidebarItem
            icon={<Icon name="sessions" />}
            label="Sessions"
            active={active === 'sessions'}
            onClick={() => setActive('sessions')}
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
            fontSize: 36,
            letterSpacing: '-0.025em',
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          {active.charAt(0).toUpperCase() + active.slice(1)}
        </h1>
        <p
          style={{
            marginTop: 8,
            color: 'var(--color-ink-2)',
            fontSize: 15,
            maxWidth: 600,
          }}
        >
          FerrLabs holding workspace — slate accent, settings-heavy sections (Org / Billing /
          Security / Account). The org name replaces a per-project switcher.
        </p>
      </main>
    </div>
  );
}

export const FerrVaultProductApp: Story = {
  name: 'Product app — FerrVault',
  render: () => <FerrVaultApp />,
};

export const FerrTrackProductApp: Story = {
  name: 'Product app — FerrTrack',
  render: () => <FerrTrackApp />,
};

export const FerrLabsHoldingApp: Story = {
  name: 'Holding workspace — FerrLabs',
  render: () => <FerrLabsAccount />,
};

export const Collapsed: Story = {
  name: 'Collapsed (FerrVault)',
  render: () => <FerrVaultApp initialCollapsed />,
};
