import {
  AppRailComponent,
  AvatarComponent,
  LogoMarkComponent,
  ProjectSwitcherComponent,
  ShellComponent,
  type AppRailItem,
  type ProjectSwitcherItem,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const ITEMS: readonly AppRailItem[] = [
  { id: 'ferrflow', label: 'FerrFlow', href: '/flow', accent: '#e8733a' },
  { id: 'ferrvault', label: 'FerrVault', href: '/vault', accent: '#10b981' },
  { id: 'ferrtrack', label: 'FerrTrack', href: '/track', accent: '#6366f1' },
  { id: 'ferrgrowth', label: 'FerrGrowth', href: '/growth', accent: '#7c3aed' },
  { id: 'ferrfleet', label: 'FerrFleet', href: '/fleet', accent: '#f59e0b' },
  { id: 'ferrlens', label: 'FerrLens', href: '/lens', accent: '#14b8a6', locked: true },
];

const ORGS: readonly ProjectSwitcherItem[] = [
  { id: 'ferrlabs', label: 'FerrLabs', meta: 'ferrlabs' },
  { id: 'ace-studio', label: 'Ace Studio', meta: 'ace-studio' },
];

const SECTIONS = [
  {
    title: 'Workspace',
    items: [
      { id: 'issues', label: 'Issues', href: '/issues', badge: 12 },
      { id: 'cycles', label: 'Cycles', href: '/cycles' },
      { id: 'projects', label: 'Projects', href: '/projects' },
    ],
  },
];

const meta: Meta<AppRailComponent> = {
  title: 'App chrome/AppRail',
  component: AppRailComponent,
  decorators: [
    moduleMetadata({
      imports: [
        AppRailComponent,
        ShellComponent,
        LogoMarkComponent,
        AvatarComponent,
        ProjectSwitcherComponent,
      ],
    }),
  ],
  args: { items: ITEMS, current: 'ferrtrack' },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<AppRailComponent>;

const shell = (variant: string) => `
      <div style="height:640px">
        <flr-shell [sections]="sections" [currentPath]="currentPath" [breadcrumb]="['Issues']">
          <flr-app-rail shell-rail [items]="items" [current]="current">
            <flr-logo-mark rail-top product="ferrlabs" accent="#ffffff" [size]="26" />
            <button
              rail-utility
              type="button"
              aria-label="Settings"
              style="width:32px;height:32px;border:none;border-radius:9px;background:transparent;color:rgba(255,255,255,.62);cursor:pointer"
            >
              &#9881;
            </button>
            <flr-avatar rail-user name="Ada Doe" [size]="32" />
          </flr-app-rail>
          <flr-project-switcher
            shell-brand
            ${variant}
            title="Switch org"
            searchPlaceholder="Search orgs…"
            [current]="currentOrg"
            [items]="orgs"
          />
          <div style="padding:32px">Page content</div>
        </flr-shell>
      </div>
    `;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="height:560px;display:flex">
        <flr-app-rail [items]="items" [current]="current">
          <flr-logo-mark rail-top product="ferrlabs" accent="#ffffff" [size]="26" />
        </flr-app-rail>
      </div>
    `,
  }),
};

export const InShell: Story = {
  render: (args) => ({
    props: { ...args, sections: SECTIONS, currentPath: '/issues', orgs: ORGS, currentOrg: ORGS[0] },
    template: shell('variant="brand"'),
  }),
};

export const BrandRowWithoutVariant: Story = {
  render: (args) => ({
    props: { ...args, sections: SECTIONS, currentPath: '/issues', orgs: ORGS, currentOrg: ORGS[0] },
    template: shell(''),
  }),
};
