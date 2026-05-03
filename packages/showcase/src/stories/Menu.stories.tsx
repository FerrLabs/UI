import { Avatar, Button } from '@ferrlabs/ui-react';
import type { Meta, StoryObj } from '@storybook/react';
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '@ferrlabs/ui-primitives';

const meta: Meta = {
  title: 'Disclosure/Menu',
};

export default meta;
type Story = StoryObj;

export const UserMenu: Story = {
  render: () => (
    <Menu trigger={<Avatar name="Ada Lovelace" size="md" className="cursor-pointer" />} align="end">
      <MenuLabel>Signed in as ada@acme.com</MenuLabel>
      <MenuSeparator />
      <MenuItem icon={<span aria-hidden>👤</span>} href="/settings/profile">
        Profile
      </MenuItem>
      <MenuItem icon={<span aria-hidden>⚙</span>} href="/settings/prefs" shortcut="⌘,">
        Preferences
      </MenuItem>
      <MenuItem icon={<span aria-hidden>📥</span>} onSelect={() => alert('Export')}>
        Export my data
      </MenuItem>
      <MenuSeparator />
      <MenuItem destructive onSelect={() => alert('Sign out')}>
        Sign out
      </MenuItem>
    </Menu>
  ),
};

export const ContextMenu: Story = {
  render: () => (
    <Menu trigger={<Button variant="ghost">Actions ▾</Button>}>
      <MenuItem onSelect={() => {}}>Edit</MenuItem>
      <MenuItem onSelect={() => {}} shortcut="⌘D">
        Duplicate
      </MenuItem>
      <MenuItem disabled>Archive (coming)</MenuItem>
      <MenuSeparator />
      <MenuItem destructive onSelect={() => {}} shortcut="⌘⌫">
        Delete
      </MenuItem>
    </Menu>
  ),
};
