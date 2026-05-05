import { Button } from '@ferrlabs/ui/react';
import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from '@ferrlabs/ui/primitives';

const meta: Meta<typeof Popover> = {
  title: 'Overlays/Popover',
  component: Popover,
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover trigger={<Button variant="ghost">Open menu</Button>} side="bottom" align="start">
      <div className="flex flex-col w-44">
        {['Profile', 'Preferences', 'Sign out'].map((label) => (
          <button
            key={label}
            type="button"
            className="text-left px-3 py-1.5 rounded text-sm hover:bg-slate-100 cursor-pointer"
          >
            {label}
          </button>
        ))}
      </div>
    </Popover>
  ),
};

export const FourSides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-12 p-24">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <div key={side} className="flex justify-center">
          <Popover trigger={<Button variant="ghost">{side}</Button>} side={side}>
            <div className="px-2 py-1 text-sm">Side: {side}</div>
          </Popover>
        </div>
      ))}
    </div>
  ),
};

export const InfoPanel: Story = {
  render: () => (
    <Popover trigger={<Button variant="ghost">FerrFlow status</Button>} side="bottom" align="end">
      <div className="w-64 p-2">
        <div className="text-sm font-medium text-slate-900">FerrFlow CLI</div>
        <p className="mt-1 text-xs text-slate-500">
          v4.2 — last release 3 days ago. Self-hostable, open source, MIT.
        </p>
        <a
          href="https://ferrflow.com"
          className="mt-2 inline-block text-xs text-accent hover:underline"
        >
          Visit ferrflow.com →
        </a>
      </div>
    </Popover>
  ),
};
