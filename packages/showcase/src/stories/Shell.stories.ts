import { ButtonComponent, ShellComponent, UserMenuComponent } from '@ferrlabs/ui-ng';
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
  decorators: [moduleMetadata({ imports: [ShellComponent, ButtonComponent, UserMenuComponent] })],
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
