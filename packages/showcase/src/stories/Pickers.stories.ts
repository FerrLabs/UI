import { signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComboboxComponent, MultiSelectComponent, TreeSelectComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const REGIONS = [
  { id: 'eu-west-1', label: 'eu-west-1', hint: 'Ireland' },
  { id: 'eu-central-1', label: 'eu-central-1', hint: 'Frankfurt' },
  { id: 'us-east-1', label: 'us-east-1', hint: 'N. Virginia' },
  { id: 'ap-south-1', label: 'ap-south-1', hint: 'Mumbai' },
];

const WORKFLOWS = [
  { value: 'wf-nightly', label: 'Nightly build', hint: 'Workflow' },
  { value: 'wf-release', label: 'Release train', hint: 'Workflow' },
  { value: 'ag-triage', label: 'Triage agent', hint: 'Agent' },
  { value: 'ag-review', label: 'Review agent', hint: 'Agent' },
];

const GROUPS = [
  { id: 'eu', label: 'Europe', options: REGIONS.slice(0, 2) },
  { id: 'us', label: 'Americas', options: REGIONS.slice(2, 3) },
  { id: 'apac', label: 'Asia Pacific', hint: 'Higher latency', options: REGIONS.slice(3) },
];

const meta: Meta = {
  title: 'Forms/Pickers',
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, ComboboxComponent, MultiSelectComponent, TreeSelectComponent],
    }),
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

export const Combobox: Story = {
  render: () => ({
    props: { options: WORKFLOWS, picked: new FormControl<string | null>('wf-release') },
    template: `
      <div style="max-width:320px; min-height:360px">
        <flr-combobox
          [options]="options"
          aria-label="Target"
          placeholder="Pick a target"
          searchPlaceholder="Search targets"
          [formControl]="picked"
        />
        <p data-testid="value" style="margin-top:12px">{{ picked.value }}</p>
        <button type="button" data-testid="write" (click)="picked.setValue('ag-triage')">Write</button>
        <button type="button" data-testid="reset" (click)="picked.setValue(null)">Reset</button>
      </div>
      <p data-testid="outside">Outside</p>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('combobox', { name: /^Target:/ });
    const value = canvas.getByTestId('value');
    await expect(trigger).toHaveTextContent('Release train');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(canvas.getByTestId('write'));
    await expect(trigger).toHaveTextContent('Triage agent');
    await userEvent.click(canvas.getByTestId('reset'));
    await expect(trigger).toHaveTextContent('Pick a target');

    await userEvent.click(trigger);
    const listbox = await overlay.findByRole('listbox');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(listbox).not.toHaveAttribute('aria-multiselectable');
    await expect(within(listbox).getAllByRole('option')).toHaveLength(4);
    await waitFor(() =>
      expect(overlay.getByRole('combobox', { name: 'Search targets' })).toHaveFocus(),
    );

    await userEvent.keyboard('agent');
    await waitFor(() => expect(within(listbox).getAllByRole('option')).toHaveLength(2));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(value).toHaveTextContent('ag-review'));
    await expect(trigger).toHaveTextContent('Review agent');
    await waitFor(() => expect(overlay.queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    const reopened = await overlay.findByRole('listbox');
    await expect(within(reopened).getAllByRole('option')).toHaveLength(4);
    await expect(within(reopened).getByRole('option', { name: /Review agent/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(overlay.queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(value).toHaveTextContent('ag-review');

    await userEvent.click(trigger);
    await overlay.findByRole('listbox');
    await userEvent.keyboard('zzz');
    await expect(await overlay.findByText('No match.')).toBeVisible();
    await userEvent.click(canvas.getByTestId('outside'));
    await waitFor(() => expect(overlay.queryByRole('listbox')).toBeNull());
  },
};

export const ComboboxAsync: Story = {
  render: () => {
    const options = signal<typeof WORKFLOWS>([]);
    const loading = signal(false);
    const queries = signal<string[]>([]);
    const search = (query: string) => {
      queries.update((all) => [...all, query]);
      loading.set(true);
      setTimeout(() => {
        const q = query.toLowerCase();
        options.set(
          WORKFLOWS.filter((o) => o.value.includes(q) || o.label.toLowerCase().includes(q)),
        );
        loading.set(false);
      }, 150);
    };
    return {
      props: { options, loading, queries, search, picked: new FormControl<string | null>(null) },
      template: `
        <div style="max-width:320px; min-height:360px">
          <flr-combobox
            [options]="options()"
            [loading]="loading()"
            [localFilter]="false"
            aria-label="Target"
            [formControl]="picked"
            (searchChange)="search($event)"
          />
          <p data-testid="queries">{{ queries().join('|') }}</p>
          <p data-testid="value">{{ picked.value }}</p>
        </div>`,
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('combobox', { name: /^Target:/ });
    const queries = canvas.getByTestId('queries');

    await userEvent.click(trigger);
    const listbox = await overlay.findByRole('listbox');
    await expect(await overlay.findByText('Nothing to choose from.')).toBeVisible();

    await userEvent.keyboard('wf-r');
    await expect(listbox).toHaveAttribute('aria-busy', 'false');
    await waitFor(() => expect(queries).toHaveTextContent('wf-r'));
    await expect(await overlay.findByText('Loading…')).toBeVisible();
    await waitFor(() => expect(within(listbox).getAllByRole('option')).toHaveLength(1));
    await expect(queries).not.toHaveTextContent('w|');

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByTestId('value')).toHaveTextContent('wf-release'));
    await waitFor(() => expect(overlay.queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveTextContent('Release train');
    await waitFor(() => expect(queries).toHaveTextContent('wf-r|'));
  },
};

export const ComboboxLoading: Story = {
  render: () => ({
    props: { options: [], picked: new FormControl<string | null>(null) },
    template: `
      <div style="max-width:320px; min-height:200px">
        <flr-combobox [options]="options" [loading]="true" aria-label="Target" [formControl]="picked" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('combobox'));
    await expect(await overlay.findByRole('status')).toHaveTextContent('Loading…');
  },
};
