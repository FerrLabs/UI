import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  CheckboxComponent,
  RadioComponent,
  RadioGroupComponent,
  SwitchComponent,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta = {
  title: 'Forms/Toggles',
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        CheckboxComponent,
        SwitchComponent,
        RadioGroupComponent,
        RadioComponent,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj;

export const Checkbox: Story = {
  render: () => ({
    props: {
      approval: new FormControl(true),
      notify: new FormControl(false),
      partial: new FormControl(false),
      broken: new FormControl(false),
      locked: new FormControl({ value: true, disabled: true }),
    },
    template: `
      <div style="display:grid; gap:12px">
        <flr-checkbox label="Require approval before rotation" [formControl]="approval" />
        <flr-checkbox label="Notify the team" hint="Sends a message to #ops on every run." [formControl]="notify" />
        <flr-checkbox label="Partially selected" [indeterminate]="true" [formControl]="partial" />
        <flr-checkbox label="Invalid" [invalid]="true" [formControl]="broken" />
        <flr-checkbox label="Managed by the operator" [formControl]="locked" />
      </div>`,
  }),
};

export const Switch: Story = {
  render: () => ({
    props: {
      sync: new FormControl(true),
      dryRun: new FormControl(false),
      locked: new FormControl({ value: false, disabled: true }),
    },
    template: `
      <div style="display:grid; gap:14px">
        <flr-switch label="Auto-sync secrets" [formControl]="sync" />
        <flr-switch label="Dry run" hint="Reports what would change without writing." size="sm" [formControl]="dryRun" />
        <flr-switch label="Enterprise SSO" [formControl]="locked" />
      </div>`,
  }),
};

export const Radio: Story = {
  render: () => ({
    props: { trigger: new FormControl('schedule') },
    template: `
      <flr-radio-group [formControl]="trigger">
        <flr-radio value="manual" label="Manual" hint="Trigger runs yourself." />
        <flr-radio value="schedule" label="On a schedule" hint="Every night at 02:00 UTC." />
        <flr-radio value="webhook" label="On webhook" />
        <flr-radio value="git" label="On push" [disabled]="true" />
      </flr-radio-group>`,
  }),
};

export const RadioHorizontal: Story = {
  render: () => ({
    props: { size: new FormControl('md') },
    template: `
      <flr-radio-group orientation="horizontal" [formControl]="size">
        <flr-radio value="sm" label="Small" />
        <flr-radio value="md" label="Medium" />
        <flr-radio value="lg" label="Large" />
      </flr-radio-group>`,
  }),
};
