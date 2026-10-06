import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectComponent, TreeSelectComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const REGIONS = [
  { id: 'eu-west-1', label: 'eu-west-1', hint: 'Ireland' },
  { id: 'eu-central-1', label: 'eu-central-1', hint: 'Frankfurt' },
  { id: 'us-east-1', label: 'us-east-1', hint: 'N. Virginia' },
  { id: 'ap-south-1', label: 'ap-south-1', hint: 'Mumbai' },
];

const GROUPS = [
  { id: 'eu', label: 'Europe', options: REGIONS.slice(0, 2) },
  { id: 'us', label: 'Americas', options: REGIONS.slice(2, 3) },
  { id: 'apac', label: 'Asia Pacific', hint: 'Higher latency', options: REGIONS.slice(3) },
];

const meta: Meta = {
  title: 'Forms/Pickers',
  decorators: [
    moduleMetadata({ imports: [ReactiveFormsModule, MultiSelectComponent, TreeSelectComponent] }),
  ],
};

export default meta;
type Story = StoryObj;

export const MultiSelect: Story = {
  render: () => ({
    props: { options: REGIONS, picked: new FormControl(['eu-west-1']) },
    template: `
      <div style="max-width:320px">
        <flr-multi-select [options]="options" label="Regions" [formControl]="picked" />
      </div>`,
  }),
};

export const MultiSelectLoading: Story = {
  render: () => ({
    props: { options: [], picked: new FormControl([]) },
    template: `
      <div style="max-width:320px">
        <flr-multi-select [options]="options" label="Regions" [loading]="true" [formControl]="picked" />
      </div>`,
  }),
};

export const MultiSelectDropdown: Story = {
  render: () => ({
    props: { options: REGIONS, picked: new FormControl(['eu-west-1']) },
    template: `
      <div style="max-width:280px; min-height:420px">
        <flr-multi-select
          mode="dropdown"
          [options]="options"
          label="Regions"
          placeholder="Any region"
          [formControl]="picked"
        />
        <p data-testid="value" style="margin-top:12px">{{ picked.value.join(',') }}</p>
      </div>
      <p data-testid="outside">Outside</p>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: /^Regions:/ });
    const value = canvas.getByTestId('value');
    await expect(trigger).toHaveTextContent('eu-west-1');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');

    await userEvent.click(trigger);
    const listbox = await overlay.findByRole('listbox');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.click(within(listbox).getByRole('option', { name: /us-east-1/ }));
    await waitFor(() => expect(value).toHaveTextContent('eu-west-1,us-east-1'));
    await expect(trigger).toHaveTextContent('2 selected');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(overlay.queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await overlay.findByRole('listbox');
    await userEvent.click(canvas.getByTestId('outside'));
    await waitFor(() => expect(overlay.queryByRole('listbox')).toBeNull());

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await overlay.findByRole('listbox');
    await waitFor(() => expect(overlay.getByRole('searchbox')).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{ArrowDown} ');
    await waitFor(() => expect(value).toHaveTextContent('eu-west-1,us-east-1,eu-central-1'));
    await expect(
      within(overlay.getByRole('listbox')).getByRole('option', { name: /eu-central-1/ }),
    ).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(overlay.getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(trigger).toHaveTextContent('Any region'));
    await expect(value.textContent?.trim()).toBe('');
  },
};

export const TreeSelect: Story = {
  render: () => ({
    props: { groups: GROUPS, picked: new FormControl(['eu-west-1', 'us-east-1']) },
    template: `
      <div style="max-width:320px">
        <flr-tree-select [groups]="groups" label="Regions" [startExpanded]="true" [formControl]="picked" />
      </div>`,
  }),
};
