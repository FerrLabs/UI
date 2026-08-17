import { BarChartComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const DAYS = Array.from({ length: 30 }, (_, i) => ({
  label: `Aug ${i + 1}`,
  value: Math.round(40 + 60 * Math.abs(Math.sin(i / 3))),
}));

const meta: Meta<BarChartComponent> = {
  title: 'Primitives/BarChart',
  component: BarChartComponent,
  decorators: [moduleMetadata({ imports: [BarChartComponent] })],
  args: {
    points: DAYS,
    title: 'Runs per day',
    summary: '1,284 runs, 30 days',
    height: 120,
    labelEvery: 7,
    color: 'var(--color-accent)',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:560px">
        <flr-bar-chart [points]="points" [title]="title" [summary]="summary" [height]="height"
                       [labelEvery]="labelEvery" [color]="color" />
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<BarChartComponent>;

export const Default: Story = {};

export const Empty: Story = { args: { points: [], summary: '' } };

export const WithFailures: Story = {
  args: {
    points: DAYS.map((d, i) => ({ ...d, danger: i % 5 === 0 ? Math.round(d.value * 0.4) : 0 })),
    title: 'Runs per day',
    summary: '1,284 runs, 96 failed',
  },
};

/** The scale rounds up to the next round number, so the top tick is a number worth reading. */
export const LargeValues: Story = {
  args: {
    points: DAYS.map((d) => ({ ...d, value: d.value * 137 })),
    title: 'Requests per day',
    summary: '1.6M requests',
  },
};

/** A point carrying its own `title` owns the whole tooltip, value line included. */
export const CustomTooltip: Story = {
  args: {
    points: DAYS.map((d) => ({ ...d, title: `${d.label}: ${d.value} runs, 2 agents` })),
    title: 'Runs per day',
    summary: 'custom tooltip text',
  },
};

/** A flat series still draws a hairline per column rather than an empty plot. */
export const AllZero: Story = {
  args: {
    points: DAYS.map((d) => ({ ...d, value: 0 })),
    title: 'Runs per day',
    summary: 'nothing ran',
  },
};
