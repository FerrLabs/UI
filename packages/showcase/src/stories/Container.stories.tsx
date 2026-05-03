import type { Meta, StoryObj } from '@storybook/react';
import { Container } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 py-6 bg-slate-100">
      {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((size) => (
        <Container key={size} size={size}>
          <div className="rounded bg-white ring-1 ring-slate-200 px-4 py-3 text-sm">
            <code className="text-xs text-slate-500">size=\"{size}\"</code>
          </div>
        </Container>
      ))}
    </div>
  ),
};
