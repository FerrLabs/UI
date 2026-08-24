import {
  AppRailComponent,
  LogoMarkComponent,
  ShellComponent,
  type AppRailItem,
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
  decorators: [moduleMetadata({ imports: [AppRailComponent, ShellComponent, LogoMarkComponent] })],
  args: { items: ITEMS, current: 'ferrtrack' },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<AppRailComponent>;

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
    props: { ...args, sections: SECTIONS, currentPath: '/issues' },
    template: `
      <div style="height:640px">
        <flr-shell [sections]="sections" [currentPath]="currentPath" [breadcrumb]="['Issues']">
          <flr-app-rail shell-rail [items]="items" [current]="current">
            <flr-logo-mark rail-top product="ferrlabs" accent="#ffffff" [size]="26" />
          </flr-app-rail>
          <div shell-brand style="display:flex;align-items:center;gap:10px;padding:0 4px">
            <flr-logo-mark product="ferrtrack" accent="#6366f1" [size]="26" />
            <span style="font-weight:600">Ace Studio</span>
          </div>
          <div style="padding:32px">Page content</div>
        </flr-shell>
      </div>
    `,
  }),
};
