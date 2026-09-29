import { SegmentedComponent, type SegmentedOption } from '@ferrlabs/ui-ng';
import { icons } from '@ferrlabs/ui-foundation/icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const rows =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>';

const views: readonly SegmentedOption[] = [
  { value: 'grid', label: 'Grid', icon: icons.products },
  { value: 'table', label: 'Table', icon: rows },
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
