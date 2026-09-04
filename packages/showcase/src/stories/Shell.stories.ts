import {
  AppRailComponent,
  AvatarComponent,
  ButtonComponent,
  LogoMarkComponent,
  ShellComponent,
  UserMenuComponent,
} from '@ferrlabs/ui-ng';
import { icons } from '@ferrlabs/ui-foundation/icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const SECTIONS = [
  {
    title: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', href: '/' },
      { id: 'agents', label: 'Agents', href: '/agents', badge: 12 },
      { id: 'runs', label: 'Runs', href: '/runs', badge: 3 },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'members', label: 'Members', href: '/members' },
      { id: 'billing', label: 'Billing', href: '/billing' },
      { id: 'delete', label: 'Delete workspace', href: '/danger', danger: true },
    ],
  },
];

const meta: Meta<ShellComponent> = {
  title: 'App chrome/Shell',
  component: ShellComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ShellComponent,
        ButtonComponent,
        UserMenuComponent,
        AppRailComponent,
        LogoMarkComponent,
        AvatarComponent,
      ],
    }),
  ],
  args: {
    productName: 'FerrFleet',
    marketingHref: 'https://ferrfleet.com',
    sections: SECTIONS,
    currentPath: '/agents',
    breadcrumb: ['Agents', 'vault-rotator'],
    searchEnabled: true,
  },
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    props: args,
    template: `
      <div style="height:560px">
        <flr-shell
          [productName]="productName" [marketingHref]="marketingHref" [sections]="sections"
          [currentPath]="currentPath" [breadcrumb]="breadcrumb" [searchEnabled]="searchEnabled"
        >
          <flr-button shell-actions size="sm">Run now</flr-button>
          <flr-user-menu shell-user name="Bryan Ferrando" email="bryan@ferrlabs.com" [showName]="false" />
          <div style="padding:24px">
            <h2 style="margin:0 0 8px">vault-rotator</h2>
            <p style="margin:0; color:var(--color-fg-2)">Rotates FerrVault secrets nightly.</p>
          </div>
        </flr-shell>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<ShellComponent>;

export const Default: Story = {};

export const NoSearch: Story = { args: { searchEnabled: false, breadcrumb: [] } };

export const UntrustedIconMarkup: Story = {
  args: {
    sections: [
      {
        title: 'Icons',
        items: [
          { id: 'svg', label: 'Allowed SVG', icon: icons.overview, href: '/svg' },
          { id: 'emoji', label: 'Emoji glyph', icon: '⌨', href: '/emoji' },
          {
            id: 'injection',
            label: 'Injection attempt',
            icon: '<img src=x onerror="window.__iconXss = true">',
            href: '/injection',
          },
        ],
      },
    ],
    currentPath: '/svg',
    breadcrumb: ['Icons'],
  },
};

export const LongContent: Story = {
  render: (args) => ({
    props: {
      ...args,
      rows: Array.from({ length: 60 }, (_, i) => i + 1),
      railItems: [
        { id: 'ferrfleet', label: 'FerrFleet', href: '#', accent: '#f59e0b', product: 'ferrfleet' },
        { id: 'ferrvault', label: 'FerrVault', href: '#', accent: '#10b981', product: 'ferrvault' },
      ],
    },
    template: `
      <flr-shell
        [productName]="productName" [marketingHref]="marketingHref" [sections]="sections"
        [currentPath]="currentPath" [breadcrumb]="breadcrumb" [searchEnabled]="searchEnabled"
      >
        <flr-app-rail shell-rail [items]="railItems" current="ferrfleet">
          <flr-logo-mark rail-top product="ferrlabs" accent="#ffffff" [size]="26" />
          <flr-avatar rail-user name="Ada Doe" [size]="32" />
        </flr-app-rail>
        <div style="padding:24px">
          @for (row of rows; track row) {
            <p style="margin:0 0 12px">Run #{{ row }} — rotated 4 secrets, 1.2s</p>
          }
        </div>
      </flr-shell>`,
  }),
};
