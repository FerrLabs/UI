import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  FieldComponent,
  InputComponent,
  RadioComponent,
  RadioGroupComponent,
  SearchFieldComponent,
  SegmentedComponent,
  type SegmentedOption,
  SelectComponent,
  TextareaComponent,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const scopes: readonly SegmentedOption[] = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
];

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
        RadioComponent,
        RadioGroupComponent,
        SegmentedComponent,
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
        <flr-input aria-label="Locked" [formControl]="locked" />
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
        <flr-field label="Project name" hint="Lowercase, no spaces." [required]="true" #name0="flrField">
          <flr-input
            placeholder="ferrflow-cloud"
            [id]="name0.fieldId"
            [aria-describedby]="name0.describedBy()"
            [formControl]="name"
          />
        </flr-field>
        <flr-field label="Webhook URL" error="Must be an https:// URL." #hook0="flrField">
          <flr-input
            [id]="hook0.fieldId"
            [aria-describedby]="hook0.describedBy()"
            [invalid]="hook0.invalid()"
            [formControl]="webhook"
          />
        </flr-field>
        <flr-field label="Notes" [optional]="true" #notes0="flrField">
          <flr-textarea
            [rows]="3"
            [id]="notes0.fieldId"
            [aria-describedby]="notes0.describedBy()"
            [formControl]="notes"
          />
        </flr-field>
      </div>`,
  }),
};

export const GroupMode: Story = {
  render: () => ({
    props: {
      scopes,
      expiry: new FormControl('30'),
      scope: new FormControl('read'),
    },
    template: `
      <div style="display:grid; gap:20px; max-width:380px">
        <flr-field label="Expiry" hint="Tokens can be revoked at any time." [group]="true" #expiry0="flrField">
          <flr-radio-group
            [aria-labelledby]="expiry0.labelId"
            [aria-describedby]="expiry0.describedBy()"
            [formControl]="expiry"
          >
            <flr-radio value="30" label="30 days" />
            <flr-radio value="90" label="90 days" />
          </flr-radio-group>
        </flr-field>
        <flr-field label="Scope" error="Pick a scope." [group]="true" #scope0="flrField">
          <flr-segmented
            [options]="scopes"
            [value]="scope.value ?? 'read'"
            [aria-labelledby]="scope0.labelId"
            [aria-describedby]="scope0.describedBy()"
          />
        </flr-field>
      </div>`,
  }),
};
