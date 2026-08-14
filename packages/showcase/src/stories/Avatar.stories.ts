import { AvatarComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<AvatarComponent> = {
  title: 'Foundation/Avatar',
  component: AvatarComponent,
  decorators: [moduleMetadata({ imports: [AvatarComponent] })],
  args: { name: 'Bryan Ferrando', size: 40, shape: 'circle' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', 28, 40, 64] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
  },
  render: (args) => ({
    props: args,
    template: `<flr-avatar [name]="name" [size]="size" [shape]="shape" />`,
  }),
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const Initials: Story = {};

export const Square: Story = { args: { shape: 'square' } };

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; align-items:center; gap:12px">
        <flr-avatar name="Ada Lovelace" size="xs" />
        <flr-avatar name="Ada Lovelace" size="sm" />
        <flr-avatar name="Ada Lovelace" size="md" />
        <flr-avatar name="Ada Lovelace" size="lg" />
        <flr-avatar name="Ada Lovelace" size="xl" />
      </div>`,
  }),
};

export const Stack: Story = {
  render: () => ({
    template: `
      <div style="display:flex">
        <flr-avatar name="Ada Lovelace" [size]="32" />
        <flr-avatar name="Grace Hopper" [size]="32" style="margin-left:-8px" />
        <flr-avatar name="Katherine Johnson" [size]="32" style="margin-left:-8px" />
      </div>`,
  }),
};
