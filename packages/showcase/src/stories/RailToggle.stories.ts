import { RailToggleComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<RailToggleComponent> = {
  title: 'App chrome/RailToggle',
  component: RailToggleComponent,
  decorators: [moduleMetadata({ imports: [RailToggleComponent] })],
  args: { collapsed: false },
};

export default meta;
type Story = StoryObj<RailToggleComponent>;

export const Expanded: Story = {};

export const Collapsed: Story = { args: { collapsed: true } };
