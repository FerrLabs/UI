import { signal } from '@angular/core';
import { CopyIconComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta = {
  title: 'Primitives/Copy icon',
  decorators: [moduleMetadata({ imports: [CopyIconComponent] })],
};

export default meta;
type Story = StoryObj;

export const CopyIcon: Story = {
  render: () => {
    const copied = signal(false);
    return {
      props: {
        copied,
        toggle: () => {
          copied.set(true);
          setTimeout(() => copied.set(false), 1600);
        },
      },
      template: `
        <div style="display:flex; align-items:center; gap:24px; font-size:20px">
          <button type="button" (click)="toggle()" aria-label="Copy"
            style="display:inline-grid; place-items:center; width:44px; height:44px; border:1px solid currentColor; border-radius:10px; background:none; cursor:pointer">
            <flr-copy-icon [copied]="copied()" />
          </button>
          <flr-copy-icon />
          <flr-copy-icon [copied]="true" />
        </div>`,
    };
  },
};
