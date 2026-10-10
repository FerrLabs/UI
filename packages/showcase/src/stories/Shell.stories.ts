import {
  AppRailComponent,
  AppSwitcherComponent,
  AvatarComponent,
  ButtonComponent,
  DEFAULT_APPS,
  LogoMarkComponent,
  ProjectSwitcherComponent,
  ShellComponent,
  UserMenuComponent,
  entitledApps,
  type ProjectSwitcherItem,
} from '@ferrlabs/ui-ng';
import { icons } from '@ferrlabs/ui-foundation/icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, waitFor, within } from 'storybook/test';

const ORGS: readonly ProjectSwitcherItem[] = [
  { id: 'ferrlabs', label: 'FerrLabs', meta: 'ferrlabs' },
  { id: 'ace-studio', label: 'Ace Studio', meta: 'ace-studio' },
];

const USER_ITEMS = [
  { id: 'account', label: 'Account settings', href: '/account' },
  { id: 'sign-out', label: 'Sign out', danger: true, separatorAbove: true },
];

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
        AppSwitcherComponent,
        LogoMarkComponent,
        AvatarComponent,
        ProjectSwitcherComponent,
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
    collapsed: false,
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
          <flr-user-menu shell-user name="Bryan Ferrando" email="bryan@ferrlabs.com" />
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

export const FullBleedTable: Story = {
  render: (args) => ({
    props: { ...args, rows: Array.from({ length: 60 }, (_, i) => i + 1) },
    template: `
      <flr-shell
        [productName]="productName" [marketingHref]="marketingHref" [sections]="sections"
        [currentPath]="currentPath" [breadcrumb]="breadcrumb" [searchEnabled]="searchEnabled"
      >
        <table class="full-bleed" style="width:100%; border-collapse:collapse">
          <tbody>
            @for (row of rows; track row) {
              <tr style="border-bottom:1px solid var(--color-rule)">
                <td style="padding:14px 28px">Run #{{ row }}</td>
              </tr>
            }
          </tbody>
        </table>
      </flr-shell>`,
  }),
  play: async ({ canvasElement }) => {
    const main = canvasElement.querySelector<HTMLElement>('.flr-shell__main');
    const table = canvasElement.querySelector<HTMLElement>('.full-bleed');
    if (!main || !table) throw new Error('shell main or table not found');
    main.scrollTop = main.scrollHeight;
    await waitFor(() => {
      const gap = main.getBoundingClientRect().bottom - table.getBoundingClientRect().bottom;
      expect(gap).toBeGreaterThanOrEqual(32);
    });
  },
};

export const Merged: Story = {
  render: (args) => ({
    props: {
      ...args,
      apps: entitledApps(
        DEFAULT_APPS,
        [
          { product: 'ferrgrowth', tier: 'team', status: 'active' },
          { product: 'ferrfleet', tier: 'pro', status: 'active' },
        ],
        'ferrfleet',
      ),
      orgs: ORGS,
      currentOrg: ORGS[0],
      userItems: USER_ITEMS,
    },
    template: `
      <flr-shell
        [productName]="productName" [marketingHref]="marketingHref" [sections]="sections"
        [currentPath]="currentPath" [breadcrumb]="breadcrumb" [searchEnabled]="searchEnabled"
        [(collapsed)]="collapsed"
      >
        <flr-app-switcher shell-switcher [items]="apps" current="ferrfleet">
          <a switcher-footer href="/products">Manage subscriptions</a>
        </flr-app-switcher>
        <flr-project-switcher
          shell-brand
          variant="brand"
          title="Switch org"
          searchPlaceholder="Search orgs…"
          [current]="currentOrg"
          [items]="orgs"
        />
        <flr-user-menu shell-user name="Ada Doe" email="ada@ferrlabs.com" [items]="userItems" />
        <flr-button shell-actions size="sm">Run now</flr-button>
        <div style="padding:24px">
          <h2 style="margin:0 0 8px">vault-rotator</h2>
          <p style="margin:0; color:var(--color-fg-2)">Rotates FerrVault secrets nightly.</p>
        </div>
      </flr-shell>`,
  }),
};

export const DarkAccentStaysVisible: Story = {
  render: (args) => ({
    props: {
      ...args,
      sections: [
        {
          title: 'Organization',
          items: [
            { id: 'sso', label: 'SSO / SAML', href: '/sso', icon: icons.sso },
            { id: 'domains', label: 'Domains', href: '/domains', icon: icons.domains },
          ],
        },
      ],
      apps: entitledApps(DEFAULT_APPS, [], 'ferrlabs'),
    },
    template: `
      <flr-shell [sections]="sections" currentPath="/sso" accent="#1e293b">
        <flr-app-switcher shell-switcher [items]="apps" current="ferrlabs" />
        <div style="padding:24px">SSO</div>
      </flr-shell>`,
  }),
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector<HTMLElement>(
      '.flr-sb-item--active .flr-sb-item__icon',
    );
    if (!icon) throw new Error('active nav icon not found');
    await expect(getComputedStyle(icon).color).toBe('rgb(255, 255, 255)');
  },
};

export const MergedOrgSwitcherOpen: Story = {
  ...Merged,
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>('flr-project-switcher button');
    if (!trigger) throw new Error('org switcher trigger not found');
    trigger.click();
  },
};

export const UserInTheRail: Story = {
  ...Merged,
  play: async ({ canvasElement }) => {
    const rail = canvasElement.querySelector('flr-sidebar');
    const topbar = canvasElement.querySelector('.flr-shell__topbar');
    if (!rail || !topbar) throw new Error('rail or topbar not found');
    await expect(rail.querySelector('flr-user-menu')).not.toBeNull();
    await expect(topbar.querySelector('flr-user-menu')).toBeNull();
    await expect(rail.textContent).toContain('ada@ferrlabs.com');
  },
};

export const UserMenuOpensUpward: Story = {
  ...Merged,
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>('flr-user-menu button');
    if (!trigger) throw new Error('user menu trigger not found');
    trigger.click();
    await waitFor(() => {
      const panel = document.querySelector<HTMLElement>('.flr-menu__panel');
      if (!panel) throw new Error('menu panel not open');
      expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        trigger.getBoundingClientRect().top,
      );
    });
  },
};

export const CollapsedRailShowsOnlyTheAvatar: Story = {
  ...Merged,
  args: { collapsed: true },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Ada Doe' });
    await expect(trigger.closest('flr-user-menu')).not.toBeNull();
    await expect(trigger.textContent).not.toContain('ada@ferrlabs.com');
  },
};

export const CollapsedRailKeepsTheOrgReadable: Story = {
  ...Merged,
  args: { collapsed: true },
  play: async ({ canvasElement }) => {
    const org = canvasElement.querySelector<HTMLButtonElement>('flr-project-switcher button');
    const app = canvasElement.querySelector<HTMLButtonElement>('flr-app-switcher button');
    if (!org || !app) throw new Error('rail switchers not found');
    await expect(org.getAttribute('aria-label')).toBe('FerrLabs');
    await expect(org.textContent?.trim()).toBe('F');
    await expect(app.textContent).not.toContain('Switch app');
  },
};

export const CollapsedRailSwitchersFillTheRail: Story = {
  ...CollapsedRailKeepsTheOrgReadable,
  play: async ({ canvasElement }) => {
    const app = canvasElement.querySelector<HTMLElement>('flr-app-switcher .flr-as__trigger');
    const mark = canvasElement.querySelector<HTMLElement>('flr-app-switcher .flr-as__mark');
    const org = canvasElement.querySelector<HTMLElement>('flr-project-switcher .flr-ps__brand');
    const monogram = canvasElement.querySelector<HTMLElement>(
      'flr-project-switcher .flr-ps__monogram',
    );
    if (!app || !mark || !org || !monogram) throw new Error('collapsed switchers not found');
    await waitFor(() => {
      expect(getComputedStyle(app).borderTopWidth).toBe('0px');
      expect(getComputedStyle(app).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(
        Math.abs(mark.getBoundingClientRect().width - app.getBoundingClientRect().width),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(monogram.getBoundingClientRect().width - (org.getBoundingClientRect().width - 16)),
      ).toBeLessThanOrEqual(1);
    });
  },
};

export const CollapsedRailOrgSwitcherOpensBesideTheRail: Story = {
  ...CollapsedRailKeepsTheOrgReadable,
  play: async ({ canvasElement }) => {
    const org = canvasElement.querySelector<HTMLButtonElement>('flr-project-switcher button');
    const rail = canvasElement.querySelector<HTMLElement>('flr-sidebar aside');
    if (!org || !rail) throw new Error('org switcher or rail not found');
    org.click();
    await waitFor(() => {
      const panel = canvasElement.querySelector<HTMLElement>('.flr-ps__panel');
      if (!panel) throw new Error('org panel not open');
      const box = panel.getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(rail.getBoundingClientRect().right);
      expect(box.width).toBeGreaterThanOrEqual(240);
    });
  },
};
