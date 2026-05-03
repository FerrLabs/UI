import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Drawer } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Drawer> = {
  title: 'Primitives/Drawer',
  component: Drawer,
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const RightSide: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer (right)</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Filters"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Apply</Button>
            </>
          }
        >
          <p>
            Drawers are the right shape for forms with several inputs that don't deserve a full page
            navigation but feel cramped in a modal — filter panels, settings details, audit log
            entries.
          </p>
        </Drawer>
      </>
    );
  },
};

export const LeftSide: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer (left)</Button>
        <Drawer open={open} onClose={() => setOpen(false)} side="left" title="Navigation">
          <ul className="flex flex-col gap-1.5">
            {['Overview', 'Members', 'Billing', 'Audit log', 'Settings'].map((label) => (
              <li key={label}>
                <a href="#" className="block px-2 py-1.5 rounded hover:bg-slate-100">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Drawer>
      </>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | null>(null);
    return (
      <div className="flex gap-2">
        <Button onClick={() => setSize('sm')}>Small</Button>
        <Button onClick={() => setSize('md')}>Medium</Button>
        <Button onClick={() => setSize('lg')}>Large</Button>
        <Drawer
          open={size !== null}
          onClose={() => setSize(null)}
          title={`Size: ${size}`}
          size={size ?? 'md'}
        >
          Width adapts to the size prop.
        </Drawer>
      </div>
    );
  },
};
