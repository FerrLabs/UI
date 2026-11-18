import { SplitterComponent, SplitterPaneComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<SplitterComponent> = {
  title: 'Layout/Splitter',
  component: SplitterComponent,
  decorators: [moduleMetadata({ imports: [SplitterComponent, SplitterPaneComponent] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<SplitterComponent>;

const frame = 'height: 320px; border: 1px solid var(--color-rule); border-radius: 8px;';
const pad = 'padding: 16px; color: var(--color-ink);';

export const Horizontal: Story = {
  render: () => ({
    template: `
      <div style="${frame}">
        <flr-splitter>
          <flr-splitter-pane label="Sidebar" defaultSize="30%" minSize="15%" maxSize="60%">
            <div style="${pad}">Sidebar. Drag the handle, or focus it and use the arrow keys (Shift for bigger steps), Home and End. Double-click resets.</div>
          </flr-splitter-pane>
          <flr-splitter-pane label="Content" minSize="200">
            <div style="${pad}">Content</div>
          </flr-splitter-pane>
        </flr-splitter>
      </div>`,
  }),
};

export const ThreePanes: Story = {
  render: () => ({
    template: `
      <div style="${frame}">
        <flr-splitter>
          <flr-splitter-pane label="Files" defaultSize="220" minSize="120" maxSize="400">
            <div style="${pad}">Files</div>
          </flr-splitter-pane>
          <flr-splitter-pane label="Editor" minSize="200">
            <div style="${pad}">Editor</div>
          </flr-splitter-pane>
          <flr-splitter-pane label="Preview" defaultSize="25%" minSize="120">
            <div style="${pad}">Preview</div>
          </flr-splitter-pane>
        </flr-splitter>
      </div>`,
  }),
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <div style="${frame}">
        <flr-splitter orientation="vertical">
          <flr-splitter-pane label="Editor" minSize="80">
            <div style="${pad}">Editor</div>
          </flr-splitter-pane>
          <flr-splitter-pane label="Terminal" defaultSize="35%" minSize="60" maxSize="70%">
            <div style="${pad}">Terminal</div>
          </flr-splitter-pane>
        </flr-splitter>
      </div>`,
  }),
};

export const Nested: Story = {
  render: () => ({
    template: `
      <div style="${frame}">
        <flr-splitter>
          <flr-splitter-pane label="Sidebar" defaultSize="25%" minSize="15%">
            <div style="${pad}">Sidebar</div>
          </flr-splitter-pane>
          <flr-splitter-pane label="Main" minSize="200">
            <flr-splitter orientation="vertical">
              <flr-splitter-pane label="Editor" minSize="60">
                <div style="${pad}">Editor</div>
              </flr-splitter-pane>
              <flr-splitter-pane label="Output" defaultSize="40%" minSize="60">
                <div style="${pad}">Output</div>
              </flr-splitter-pane>
            </flr-splitter>
          </flr-splitter-pane>
        </flr-splitter>
      </div>`,
  }),
};

export const Collapsible: Story = {
  render: () => ({
    props: { collapsed: false },
    template: `
      <div style="${frame}">
        <flr-splitter>
          <flr-splitter-pane label="Sidebar" defaultSize="260" minSize="160" collapsible [(collapsed)]="collapsed">
            <div style="${pad}">Focus the handle and press Enter to collapse or expand.</div>
          </flr-splitter-pane>
          <flr-splitter-pane label="Content" minSize="200">
            <div style="${pad}">Content. Sidebar collapsed: {{ collapsed }}</div>
          </flr-splitter-pane>
        </flr-splitter>
      </div>`,
  }),
};

export const Persisted: Story = {
  render: () => ({
    template: `
      <div style="${frame}">
        <flr-splitter storageKey="storybook-splitter-demo">
          <flr-splitter-pane label="Sidebar" defaultSize="30%" minSize="15%" collapsible>
            <div style="${pad}">Sizes and collapsed state survive a reload (localStorage).</div>
          </flr-splitter-pane>
          <flr-splitter-pane label="Content" minSize="200">
            <div style="${pad}">Content</div>
          </flr-splitter-pane>
        </flr-splitter>
      </div>`,
  }),
};

export const RightToLeft: Story = {
  render: () => ({
    template: `
      <div dir="rtl" style="${frame}">
        <flr-splitter>
          <flr-splitter-pane label="Sidebar" defaultSize="30%" minSize="15%">
            <div style="${pad}">Panes and arrow keys follow the writing direction.</div>
          </flr-splitter-pane>
          <flr-splitter-pane label="Content" minSize="200">
            <div style="${pad}">Content</div>
          </flr-splitter-pane>
        </flr-splitter>
      </div>`,
  }),
};

export const StackedOnNarrowWidth: Story = {
  render: () => ({
    template: `
      <div style="resize: horizontal; overflow: auto; width: 720px; max-width: 100%; border: 1px dashed var(--color-rule); padding: 8px;">
        <div style="height: 320px;">
          <flr-splitter stackBelow="520" keyboardStep="20">
            <flr-splitter-pane label="Sidebar" defaultSize="30%" minSize="120">
              <div style="${pad}">Drag the corner of the dashed box under 520px: panes stack and the handle is removed.</div>
            </flr-splitter-pane>
            <flr-splitter-pane label="Content" minSize="200">
              <div style="${pad}">Content</div>
            </flr-splitter-pane>
          </flr-splitter>
        </div>
      </div>`,
  }),
};

export const ForcedStacked: Story = {
  render: () => ({
    template: `
      <div style="${frame}">
        <flr-splitter stacked>
          <flr-splitter-pane label="Sidebar">
            <div style="${pad}">Stacked with the bare attribute: no handles.</div>
          </flr-splitter-pane>
          <flr-splitter-pane label="Content">
            <div style="${pad}">Content</div>
          </flr-splitter-pane>
        </flr-splitter>
      </div>`,
  }),
};
