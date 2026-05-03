import { Avatar, Button } from '@ferrlabs/ui-react';
import type { Meta, StoryObj } from '@storybook/react';
import { Navbar, NavLink } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Navbar> = {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

const Brand = () => (
  <a href="/" className="flex items-center gap-2 cursor-pointer">
    <span className="font-mono text-xs opacity-50">[</span>
    <span className="font-bold tracking-tight">FerrLabs</span>
    <span className="font-mono text-xs opacity-50">]</span>
  </a>
);

export const Light: Story = {
  args: {
    brand: <Brand />,
    links: (
      <>
        <NavLink href="#products" active>
          Products
        </NavLink>
        <NavLink href="#pricing">Pricing</NavLink>
        <NavLink href="#docs">Docs</NavLink>
        <NavLink href="#blog">Blog</NavLink>
      </>
    ),
    actions: (
      <>
        <Button variant="ghost" size="sm">
          Sign in
        </Button>
        <Button size="sm">Create org</Button>
      </>
    ),
  },
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    brand: <Brand />,
    links: (
      <>
        <NavLink href="#products" variant="dark" active>
          Products
        </NavLink>
        <NavLink href="#pricing" variant="dark">
          Pricing
        </NavLink>
        <NavLink href="#docs" variant="dark">
          Docs
        </NavLink>
      </>
    ),
    actions: (
      <>
        <Avatar name="Ada Lovelace" size="sm" />
      </>
    ),
  },
};

export const Sticky: Story = {
  args: {
    sticky: true,
    brand: <Brand />,
    links: (
      <>
        <NavLink href="#a">A</NavLink>
        <NavLink href="#b">B</NavLink>
      </>
    ),
    actions: <Button size="sm">Sign in</Button>,
  },
  render: (args) => (
    <div>
      <Navbar {...args} />
      <div className="h-[200vh] p-6 text-sm text-slate-500">
        Scroll — the navbar stays at the top.
      </div>
    </div>
  ),
};
