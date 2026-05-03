import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, SidebarItem, SidebarSection } from '@ferrlabs/ui-primitives';
import { Avatar, Button, LogoMark, Tag } from '@ferrlabs/ui-react';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

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

const FerrFlowBrand = ({ collapsed }: { collapsed: boolean }) => (
  <>
    <LogoMark product="ferrflow" accent="var(--color-ferrflow-orange)" />
    {!collapsed && (
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: '-0.02em',
          }}
        >
          ferrflow
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
          by ferrlabs
        </span>
      </div>
    )}
  </>
);

function ControlledShell({ initialCollapsed = false }: { initialCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [active, setActive] = useState('overview');
  return (
    <div style={{ display: 'flex', minHeight: 600, background: 'var(--color-app-bg, #fafaf9)' }}>
      <Sidebar
        brand={<FerrFlowBrand collapsed={collapsed} />}
        collapsed={collapsed}
        footer={
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="mono"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-ink-3)',
              padding: '6px 10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            {collapsed ? '→ Expand' : '← Collapse'}
          </button>
        }
      >
        <SidebarSection title="Workspace" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon d={ICONS.overview} />}
            label="Overview"
            active={active === 'overview'}
            onClick={() => setActive('overview')}
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<Icon d={ICONS.members} />}
            label="Members"
            active={active === 'members'}
            onClick={() => setActive('members')}
            badge={
              <Tag size="sm" variant="neutral" soft>
                12
              </Tag>
            }
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<Icon d={ICONS.audit} />}
            label="Audit log"
            active={active === 'audit'}
            onClick={() => setActive('audit')}
            collapsed={collapsed}
          />
        </SidebarSection>
        <SidebarSection title="Org" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon d={ICONS.billing} />}
            label="Billing"
            active={active === 'billing'}
            onClick={() => setActive('billing')}
            badge={
              <Tag size="sm" variant="warning" soft>
                !
              </Tag>
            }
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<Icon d={ICONS.settings} />}
            label="Settings"
            active={active === 'settings'}
            onClick={() => setActive('settings')}
            collapsed={collapsed}
          />
        </SidebarSection>
      </Sidebar>
      <main style={{ flex: 1, padding: 32 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 28,
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          {active.charAt(0).toUpperCase() + active.slice(1)}
        </h1>
        <p style={{ marginTop: 12, color: 'var(--color-ink-2)' }}>
          Editorial sidebar with mono uppercase labels, accent-colored active state, and collapse
          toggle. Same visual language as Shell.
        </p>
      </main>
    </div>
  );
}

export const Default: Story = {
  render: () => <ControlledShell />,
};

export const Collapsed: Story = {
  render: () => <ControlledShell initialCollapsed />,
};

export const WithUserFooter: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div style={{ display: 'flex', minHeight: 600, background: 'var(--color-app-bg, #fafaf9)' }}>
        <Sidebar
          brand={<FerrFlowBrand collapsed={collapsed} />}
          collapsed={collapsed}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 4 }}>
              <Avatar name="Ada Lovelace" size={28} accent="var(--color-ferrflow-orange)" />
              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--color-ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Ada Lovelace
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: 'var(--color-ink-3)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    ada@acme.com
                  </div>
                </div>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? '→' : '←'}
              </Button>
            </div>
          }
        >
          <SidebarItem
            icon={<Icon d={ICONS.overview} />}
            label="Overview"
            active
            collapsed={collapsed}
          />
          <SidebarItem icon={<Icon d={ICONS.members} />} label="Members" collapsed={collapsed} />
        </Sidebar>
        <main style={{ flex: 1, padding: 32, color: 'var(--color-ink-2)' }}>Body content</main>
      </div>
    );
  },
};
