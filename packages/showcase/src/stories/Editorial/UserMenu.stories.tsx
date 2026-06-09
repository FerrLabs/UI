import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu } from '@ferrlabs/ui-react/react';

const meta: Meta<typeof UserMenu> = {
  title: 'Navigation/UserMenu',
  component: UserMenu,
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {
  args: {
    name: 'Ada Lovelace',
    email: 'ada@acme.com',
    items: [
      { label: 'Profile', href: '/settings/profile', icon: <span aria-hidden>👤</span> },
      { label: 'Preferences', href: '/settings/prefs', icon: <span aria-hidden>⚙</span> },
      { label: 'Export my data', onClick: () => alert('Export') },
      { separatorAbove: true, label: 'Sign out', danger: true, onClick: () => alert('Sign out') },
    ],
  },
};
export const NoEmail: Story = {
  args: {
    name: 'Linus Torvalds',
    items: [{ label: 'Profile' }, { label: 'Sign out', danger: true, separatorAbove: true }],
  },
};
export const HiddenName: Story = {
  args: {
    name: 'Margaret Hamilton',
    showName: false,
    items: [{ label: 'Sign out', danger: true }],
  },
};
export const WithAvatarImage: Story = {
  args: {
    name: 'Ada Lovelace',
    email: 'ada@acme.com',
    avatarSrc: 'https://i.pravatar.cc/96?u=ada',
    accent: 'var(--color-ferrvault-emerald)',
    items: [{ label: 'Profile' }, { label: 'Sign out', danger: true, separatorAbove: true }],
  },
};
