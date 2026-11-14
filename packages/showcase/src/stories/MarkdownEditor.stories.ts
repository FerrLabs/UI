import { FormsModule } from '@angular/forms';
import { MarkdownEditorComponent } from '@ferrlabs/ui-ng/markdown';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const DRAFT = `# Release notes

Ship **markdown editing** with ~~no~~ a live preview.

- [x] Toolbar
- [ ] Shortcuts: Ctrl+B, Ctrl+I, Ctrl+K

> Select text, then use the toolbar.
`;

const meta: Meta<MarkdownEditorComponent> = {
  title: 'Content/Markdown Editor',
  component: MarkdownEditorComponent,
  decorators: [moduleMetadata({ imports: [MarkdownEditorComponent, FormsModule] })],
  render: (args) => ({
    props: { ...args, draft: DRAFT },
    template: `
      <flr-markdown-editor
        [(ngModel)]="draft"
        [placeholder]="placeholder"
        [rows]="rows"
        [minHeight]="minHeight"
      />
    `,
  }),
  args: { placeholder: 'Write some markdown', rows: 10, minHeight: null },
};

export default meta;
type Story = StoryObj<MarkdownEditorComponent>;

export const Default: Story = {};

export const Empty: Story = {
  render: (args) => ({
    props: { ...args, draft: '' },
    template: `<flr-markdown-editor [(ngModel)]="draft" [placeholder]="placeholder" />`,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: { ...args, draft: DRAFT },
    template: `<flr-markdown-editor [ngModel]="draft" [disabled]="true" />`,
  }),
};

export const TallMinimum: Story = {
  args: { minHeight: '320px' },
};

export const Narrow: Story = {
  decorators: [
    (story) => {
      const rendered = story();
      return {
        ...rendered,
        template: `<div style="max-width:360px">${rendered.template}</div>`,
      };
    },
  ],
};
