import { StatusBarsComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const DAY_MS = 86_400_000;
const START = Date.parse('2026-05-17T00:00:00Z');

const BUCKETS = Array.from({ length: 90 }, (_, i) => {
  const status = i === 61 ? 'down' : i % 17 === 0 ? 'degraded' : i < 4 ? 'unknown' : 'up';
  return {
    at: new Date(START + i * DAY_MS).toISOString(),
    status: status as 'up' | 'degraded' | 'down' | 'unknown',
    uptimePct: status === 'up' ? 100 : status === 'degraded' ? 97.4 : 62.1,
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
