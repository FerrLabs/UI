import { Button } from '@ferrlabs/ui-react';
import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof EmptyState> = {
  title: 'Data Display/EmptyState',
  component: EmptyState,
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'No members yet',
    description: 'Invite your first teammate to start collaborating on this organization.',
    action: <Button>Invite a member</Button>,
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
};

export const TitleOnly: Story = {
  args: { title: 'Nothing to see here.' },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
};

export const WithIcon: Story = {
  args: {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Activate your first product',
    description:
      'Your org is ready. Pick from FerrFlow, FerrVault, FerrTrack, FerrGrowth, or FerrFleet to start.',
    action: <Button>Browse the catalogue →</Button>,
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
};
