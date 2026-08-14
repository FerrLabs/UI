import { TagComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<TagComponent> = {
  title: 'Primitives/Tag',
  component: TagComponent,
  decorators: [moduleMetadata({ imports: [TagComponent] })],
  args: { variant: 'neutral', size: 'md', soft: false, dot: true, removable: false },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  render: (args) => ({
    props: args,
    template: `<flr-tag [variant]="variant" [size]="size" [soft]="soft" [dot]="dot" [removable]="removable">Stable</flr-tag>`,
  }),
};

export default meta;
type Story = StoryObj<TagComponent>;

export const Neutral: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:8px; flex-wrap:wrap">
        <flr-tag variant="neutral">Neutral</flr-tag>
        <flr-tag variant="accent">Accent</flr-tag>
        <flr-tag variant="success">Passing</flr-tag>
        <flr-tag variant="warning">Degraded</flr-tag>
        <flr-tag variant="danger">Failing</flr-tag>
      </div>`,
  }),
};

export const Soft: Story = { args: { soft: true, variant: 'accent' } };

export const Removable: Story = { args: { removable: true, variant: 'accent' } };
