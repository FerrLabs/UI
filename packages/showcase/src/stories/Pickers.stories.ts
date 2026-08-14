import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectComponent, TreeSelectComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

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

export const TreeSelect: Story = {
  render: () => ({
    props: { groups: GROUPS, picked: new FormControl(['eu-west-1', 'us-east-1']) },
    template: `
      <div style="max-width:320px">
        <flr-tree-select [groups]="groups" label="Regions" [startExpanded]="true" [formControl]="picked" />
      </div>`,
  }),
};
