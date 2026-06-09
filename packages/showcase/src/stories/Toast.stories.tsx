import { Button } from '@ferrlabs/ui-react/react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from '@ferrlabs/ui-react/primitives';

const meta: Meta = {
  title: 'Feedback/Toast',
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

function ToastButtons() {
  const { push } = useToast();
  return (
    <div className="flex gap-2 flex-wrap">
      <Button variant="ghost" onClick={() => push({ message: 'Saved.', variant: 'info' })}>
        Info
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          push({
            title: 'Subscription activated',
            message: 'FerrTrack · Pro tier',
            variant: 'success',
          })
        }
      >
        Success
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          push({
            title: 'Trial ending soon',
            message: '3 days left on FerrVault. Add a card to keep it active.',
            variant: 'warning',
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          push({
            title: 'Payment failed',
            message: 'We could not charge your card. Try again or update payment.',
            variant: 'error',
          })
        }
      >
        Error
      </Button>
    </div>
  );
}

export const FourVariants: Story = {
  render: () => <ToastButtons />,
};

function StackedExample() {
  const { push } = useToast();
  return (
    <Button
      onClick={() => {
        push({ message: 'Saved item 1', variant: 'success' });
        setTimeout(() => push({ message: 'Saved item 2', variant: 'success' }), 200);
        setTimeout(() => push({ message: 'Saved item 3', variant: 'success' }), 400);
      }}
    >
      Push 3 stacked
    </Button>
  );
}

export const Stacked: Story = {
  render: () => <StackedExample />,
};

function PersistentExample() {
  const { push } = useToast();
  return (
    <Button
      onClick={() =>
        push({
          title: 'Persistent until dismissed',
          message: 'duration: 0 means it stays until you click ×',
          variant: 'info',
          duration: 0,
        })
      }
    >
      Persistent toast
    </Button>
  );
}

export const Persistent: Story = {
  render: () => <PersistentExample />,
};
