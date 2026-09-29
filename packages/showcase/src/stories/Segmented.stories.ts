import { SegmentedComponent, type SegmentedOption } from '@ferrlabs/ui-ng';
import { icons } from '@ferrlabs/ui-foundation/icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const views: readonly SegmentedOption[] = [
  { value: 'grid', label: 'Grid', icon: icons.products },
  { value: 'table', label: 'Table', icon: icons.list },
];

const scopes: readonly SegmentedOption[] = [
  { value: 'all', label: 'All' },
  { value: 'attention', label: 'Needs attention' },
];

const meta: Meta<SegmentedComponent> = {
  title: 'Forms/Segmented',
  component: SegmentedComponent,
  decorators: [moduleMetadata({ imports: [SegmentedComponent] })],
};

export default meta;
type Story = StoryObj<SegmentedComponent>;

export const Labels: Story = {
  render: () => ({
    props: { scopes, scope: 'all' },
    template: `<flr-segmented aria-label="Scope" [options]="scopes" [(value)]="scope" />`,
  }),
};

export const IconOnly: Story = {
  render: () => ({
    props: { views, view: 'grid' },
    template: `<flr-segmented aria-label="View" [options]="views" [iconOnly]="true" [(value)]="view" />`,
  }),
};
