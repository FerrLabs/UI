import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Avatar,
  Badge,
  Button,
  Sidebar,
  SidebarItem,
  SidebarSection,
} from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const Brand = ({ collapsed }: { collapsed: boolean }) => (
  <div className="flex items-center gap-2 cursor-pointer">
    <span className="size-7 rounded-md bg-accent text-white grid place-items-center font-bold text-xs">
      A
    </span>
    {!collapsed && <span className="font-semibold text-sm">Acme Inc.</span>}
  </div>
);

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
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-12v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.5 8.5 2.2 2.2M5.6 18.4l2.1-2.1m8.5-8.5 2.2-2.2',
};

function ControlledShell({ initialCollapsed = false }: { initialCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  return (
    <div className="flex min-h-[480px] bg-slate-50">
      <Sidebar
        brand={<Brand collapsed={collapsed} />}
        collapsed={collapsed}
        footer={
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="w-full text-xs text-slate-500 hover:text-slate-900 cursor-pointer px-2 py-1.5 rounded hover:bg-slate-100"
          >
            {collapsed ? '→ Expand' : '← Collapse'}
          </button>
        }
      >
        <SidebarSection title="Workspace" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon d={ICONS.overview} />}
            label="Overview"
            active
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<Icon d={ICONS.members} />}
            label="Members"
            badge={
              <Badge variant="neutral" size="sm">
                12
              </Badge>
            }
            collapsed={collapsed}
          />
          <SidebarItem icon={<Icon d={ICONS.audit} />} label="Audit log" collapsed={collapsed} />
        </SidebarSection>
        <SidebarSection title="Org" collapsed={collapsed}>
          <SidebarItem
            icon={<Icon d={ICONS.billing} />}
            label="Billing"
            badge={
              <Badge variant="warning" size="sm">
                !
              </Badge>
            }
            collapsed={collapsed}
          />
          <SidebarItem icon={<Icon d={ICONS.settings} />} label="Settings" collapsed={collapsed} />
        </SidebarSection>
      </Sidebar>
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sidebar collapses with the toggle at the bottom.
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
      <div className="flex min-h-[480px] bg-slate-50">
        <Sidebar
          brand={<Brand collapsed={collapsed} />}
          collapsed={collapsed}
          footer={
            <div className="flex items-center gap-2 p-1">
              <Avatar name="Ada Lovelace" size="sm" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">Ada Lovelace</div>
                  <div className="text-[11px] text-slate-500 truncate">ada@acme.com</div>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => setCollapsed((c) => !c)}>
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
        <main className="flex-1 p-8 text-sm text-slate-500">Body content</main>
      </div>
    );
  },
};
