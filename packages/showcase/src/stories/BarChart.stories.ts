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
    summary: '1,284 runs · 30 days',
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
