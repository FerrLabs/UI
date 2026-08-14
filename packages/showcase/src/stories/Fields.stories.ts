import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FieldComponent,
  InputComponent,
  SearchFieldComponent,
  SelectComponent,
  TextareaComponent,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta = {
  title: 'Forms/Text inputs',
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        FieldComponent,
        InputComponent,
        TextareaComponent,
        SelectComponent,
        SearchFieldComponent,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj;

export const Input: Story = {
  render: () => ({
    props: {
      value: new FormControl(''),
      locked: new FormControl({ value: 'ferrflow-cloud', disabled: true }),
    },
    template: `
      <div style="display:grid; gap:12px; max-width:320px">
        <flr-input size="sm" placeholder="Small" [formControl]="value" />
        <flr-input size="md" placeholder="Medium" [formControl]="value" />
        <flr-input size="lg" placeholder="Large" [formControl]="value" />
        <flr-input [invalid]="true" placeholder="Invalid" [formControl]="value" />
        <flr-input [formControl]="locked" />
      </div>`,
  }),
};

export const Textarea: Story = {
  render: () => ({
    props: { notes: new FormControl('') },
    template: `
      <div style="max-width:420px">
        <flr-textarea [rows]="5" placeholder="Describe the incident…" [formControl]="notes" />
      </div>`,
  }),
};

export const Select: Story = {
  render: () => ({
    props: { region: new FormControl('eu-west-1'), empty: new FormControl('') },
    template: `
      <div style="display:grid; gap:12px; max-width:280px">
        <flr-select [formControl]="region" aria-label="Region">
          <option value="eu-west-1">eu-west-1</option>
          <option value="us-east-1">us-east-1</option>
          <option value="ap-south-1">ap-south-1</option>
        </flr-select>
        <flr-select size="sm" [invalid]="true" [formControl]="empty" aria-label="Invalid region">
          <option value="">Pick a region…</option>
        </flr-select>
      </div>`,
  }),
};

export const SearchField: Story = {
  render: () => ({
    props: { query: new FormControl('') },
    template: `
      <div style="max-width:320px">
        <flr-search-field placeholder="Search secrets…" [formControl]="query" />
      </div>`,
  }),
};

export const WithFieldWrapper: Story = {
  render: () => ({
    props: {
      name: new FormControl(''),
      webhook: new FormControl('http://example.com'),
      notes: new FormControl(''),
    },
    template: `
      <div style="display:grid; gap:20px; max-width:380px">
        <flr-field label="Project name" hint="Lowercase, no spaces." [required]="true">
          <flr-input placeholder="ferrflow-cloud" [formControl]="name" />
        </flr-field>
        <flr-field label="Webhook URL" error="Must be an https:// URL.">
          <flr-input [invalid]="true" [formControl]="webhook" />
        </flr-field>
        <flr-field label="Notes" [optional]="true">
          <flr-textarea [rows]="3" [formControl]="notes" />
        </flr-field>
      </div>`,
  }),
};
