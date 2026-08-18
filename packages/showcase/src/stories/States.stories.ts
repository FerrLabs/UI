import {
  ButtonComponent,
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingStateComponent,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta = {
  title: 'Primitives/States',
  decorators: [
    moduleMetadata({
      imports: [EmptyStateComponent, LoadingStateComponent, ErrorStateComponent, ButtonComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj;

export const Empty: Story = {
  render: () => ({
    template: `
      <div>
        <flr-empty-state>No secrets in this vault yet.</flr-empty-state>
        <flr-empty-state title="No secrets yet">
          A secret is a key-value pair scoped to one project.
          <flr-button empty-action size="sm">Create a secret</flr-button>
        </flr-empty-state>
      </div>`,
  }),
};

export const Loading: Story = {
  render: () => ({
    template: `
      <div>
        <flr-loading-state />
        <flr-loading-state label="Chargement…" />
      </div>`,
  }),
};

export const Error: Story = {
  render: () => ({
    template: `
      <div>
        <flr-error-state message="The vault did not answer in time." />
        <flr-error-state
          title="Sync failed"
          message="Three secrets could not be written."
          [canRetry]="false"
        />
      </div>`,
  }),
};
