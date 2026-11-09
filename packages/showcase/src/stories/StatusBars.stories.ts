import { StatusBarsComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const DAY_MS = 86_400_000;
const START = Date.parse('2026-05-17T00:00:00Z');

const BUCKETS = Array.from({ length: 90 }, (_, i) => {
  let status: 'up' | 'degraded' | 'down' | 'unknown' = 'up';
  if (i === 61) status = 'down';
  else if (i % 17 === 0) status = 'degraded';
  else if (i < 4) status = 'unknown';
  let uptimePct = 62.1;
  if (status === 'up') uptimePct = 100;
  else if (status === 'degraded') uptimePct = 97.4;
  return {
    at: new Date(START + i * DAY_MS).toISOString(),
    status,
    uptimePct,
    sampleCount: 288,
  };
});

const meta: Meta<StatusBarsComponent> = {
  title: 'Primitives/StatusBars',
  component: StatusBarsComponent,
  decorators: [moduleMetadata({ imports: [StatusBarsComponent] })],
  args: { buckets: BUCKETS, slots: 90, label: 'Availability' },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:560px">
        <flr-status-bars [buckets]="buckets" [slots]="slots" [label]="label" />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<StatusBarsComponent>;

export const NinetyDays: Story = {};

export const ThirtyDays: Story = { args: { slots: 30, buckets: BUCKETS.slice(-30) } };

export const NoData: Story = { args: { buckets: [] } };
