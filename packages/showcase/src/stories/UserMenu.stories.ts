import { UserMenuComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const ITEMS = [
  { id: 'account', label: 'Account settings', href: '/account' },
  { id: 'org', label: 'Organisation', href: '/org' },
  { id: 'tokens', label: 'API tokens', href: '/tokens' },
  { id: 'signout', label: 'Sign out', danger: true },
];

const meta: Meta<UserMenuComponent> = {
  title: 'App chrome/UserMenu',
  component: UserMenuComponent,
  decorators: [moduleMetadata({ imports: [UserMenuComponent] })],
  args: {
    name: 'Bryan Ferrando',
    email: 'bryan@ferrlabs.com',
    items: ITEMS,
    showName: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; justify-content:flex-end; padding:16px">
        <flr-user-menu [name]="name" [email]="email" [items]="items" [showName]="showName" />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<UserMenuComponent>;

export const Default: Story = {};

export const AvatarOnly: Story = { args: { showName: false } };
