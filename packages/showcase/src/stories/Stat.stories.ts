import { StatComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<StatComponent> = {
  title: 'Primitives/Stat',
  component: StatComponent,
  decorators: [moduleMetadata({ imports: [StatComponent] })],
  args: { label: 'Runs this month', value: '1,284', delta: '+12%', deltaType: 'up' },
  argTypes: { deltaType: { control: 'inline-radio', options: ['up', 'down', 'flat'] } },
  render: (args) => ({
    props: args,
    template: `<flr-stat [label]="label" [value]="value" [delta]="delta" [deltaType]="deltaType" />`,
  }),
};

export default meta;
type Story = StoryObj<StatComponent>;

export const Up: Story = {};

export const Row: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:32px; flex-wrap:wrap">
        <flr-stat label="Runs this month" value="1,284" delta="+12%" deltaType="up" />
        <flr-stat label="Failed runs" value="17" delta="-4%" deltaType="down" />
        <flr-stat label="Median duration" value="48s" delta="0%" deltaType="flat" />
        <flr-stat label="Secrets" value="312" />
      </div>`,
  }),
};
