import { RailToggleComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta = {
  title: 'App chrome/RailToggle',
  decorators: [moduleMetadata({ imports: [RailToggleComponent] })],
};

export default meta;
type Story = StoryObj;

export const Expanded: Story = {
  render: () => ({
    template: `<flr-rail-toggle [collapsed]="false" />`,
  }),
};

export const Collapsed: Story = {
  render: () => ({
    template: `<flr-rail-toggle [collapsed]="true" />`,
  }),
};
