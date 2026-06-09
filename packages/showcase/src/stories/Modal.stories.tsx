import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from '@ferrlabs/ui-react/primitives';
import { Button } from '@ferrlabs/ui-react/react';

const meta: Meta<typeof Modal> = {
  title: 'Overlays/Modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm action"
          description="This will rotate the API key for this organization. Existing tokens will keep working for 24h."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button accent="#dc2626" onClick={() => setOpen(false)}>
                Rotate key
              </Button>
            </>
          }
        />
      </>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null);
    return (
      <div className="flex gap-2">
        <Button onClick={() => setSize('sm')}>Small</Button>
        <Button onClick={() => setSize('md')}>Medium</Button>
        <Button onClick={() => setSize('lg')}>Large</Button>
        <Button onClick={() => setSize('xl')}>X-large</Button>
        <Modal
          open={size !== null}
          onClose={() => setSize(null)}
          title={`Size: ${size}`}
          size={size ?? 'md'}
          footer={<Button onClick={() => setSize(null)}>Close</Button>}
        >
          The dialog adapts to the picked size. Backdrop click and ESC dismiss it; both call{' '}
          <code>onClose</code>.
        </Modal>
      </div>
    );
  },
};

export const ContentOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open content-only</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <p>
            Modal without title, description, or footer — just children. Useful for image viewers,
            embedded videos, or fully custom layouts.
          </p>
        </Modal>
      </>
    );
  },
};
