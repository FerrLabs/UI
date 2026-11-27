import { SegmentedComponent, type SegmentedOption } from '@ferrlabs/ui-ng';
import { icons } from '@ferrlabs/ui-foundation/icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const views: readonly SegmentedOption[] = [
  { value: 'grid', label: 'Grid', icon: icons.products },
  { value: 'table', label: 'Table', icon: icons.list },
];

const scopes: readonly SegmentedOption[] = [
  { value: 'all', label: 'All' },
  { value: 'attention', label: 'Needs attention' },
];

const ranges: readonly SegmentedOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
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

export const Accent: Story = {
  ...Labels,
  globals: { accent: 'indigo' },
};

export const Dark: Story = {
  ...Labels,
  globals: { accent: 'amber', theme: 'dark' },
};

export const CustomSelection: Story = {
  render: () => ({
    props: { ranges, range: 'week' },
    template: `
      <flr-segmented
        aria-label="Range"
        style="--flr-seg-selected-bg:#fef3c7;--flr-seg-selected-rule:#b45309;--flr-seg-selected-ink:#78350f"
        [options]="ranges"
        [(value)]="range"
      />`,
  }),
};

export const IconOnly: Story = {
  render: () => ({
    props: { views, view: 'grid' },
    template: `<flr-segmented aria-label="View" [options]="views" [iconOnly]="true" [(value)]="view" />`,
  }),
};

export const Keyboard: Story = {
  render: () => ({
    props: { ranges, range: 'week' },
    template: `
      <flr-segmented aria-label="Range" [options]="ranges" [value]="range" (valueChange)="range = $event" />
      <p data-testid="range" style="margin:12px 0 0">{{ range }}</p>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = (name: string) => canvas.getByRole('radio', { name });
    const expectSelected = async (name: string, value: string) => {
      await waitFor(() => expect(canvas.getByTestId('range')).toHaveTextContent(value));
      expect(radio(name)).toHaveAttribute('aria-checked', 'true');
      expect(radio(name)).toHaveFocus();
    };

    radio('Week').focus();
    await userEvent.keyboard('{End}');
    await expectSelected('Year', 'year');
    await userEvent.keyboard('{Home}');
    await expectSelected('Day', 'day');
    await userEvent.keyboard('{ArrowLeft}');
    await expectSelected('Year', 'year');
  },
};
