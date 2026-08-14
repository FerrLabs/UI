import { ProgressBarComponent, SkeletonComponent, SpinnerComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta = {
  title: 'Primitives/Loading',
  decorators: [
    moduleMetadata({ imports: [SpinnerComponent, SkeletonComponent, ProgressBarComponent] }),
  ],
};

export default meta;
type Story = StoryObj;

export const Spinner: Story = {
  render: () => ({
    template: `
      <div style="display:flex; align-items:center; gap:16px">
        <flr-spinner size="xs" />
        <flr-spinner size="sm" />
        <flr-spinner size="md" />
        <flr-spinner size="lg" />
        <flr-spinner size="md" color="slate" />
      </div>`,
  }),
};

export const Skeleton: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:10px; max-width:320px">
        <flr-skeleton shape="circle" [width]="40" [height]="40" />
        <flr-skeleton shape="text" width="70%" />
        <flr-skeleton shape="text" width="90%" />
        <flr-skeleton shape="rect" [height]="80" />
      </div>`,
  }),
};

export const ProgressBar: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:16px; max-width:360px">
        <flr-progress-bar [value]="72" label="Secrets synced" [showValue]="true" />
        <flr-progress-bar [value]="45" variant="warning" size="sm" />
        <flr-progress-bar [value]="98" variant="danger" size="lg" label="Run quota" [showValue]="true" />
        <flr-progress-bar [indeterminate]="true" label="Provisioning" />
      </div>`,
  }),
};
