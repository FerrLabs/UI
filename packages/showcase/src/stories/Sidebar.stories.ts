import { SidebarComponent, SidebarItemComponent, SidebarSectionComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<SidebarComponent> = {
  title: 'App chrome/Sidebar',
  component: SidebarComponent,
  decorators: [
    moduleMetadata({
      imports: [SidebarComponent, SidebarSectionComponent, SidebarItemComponent],
    }),
  ],
  args: { width: 256, collapsedWidth: 64 },
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    props: { ...args, collapsed: false },
    template: `
      <div style="height:520px; display:flex; background:var(--color-paper)">
        <flr-sidebar [width]="width" [collapsedWidth]="collapsedWidth">
          <flr-sidebar-section title="Workspace">
            <flr-sidebar-item label="Overview" [active]="true" />
            <flr-sidebar-item label="Agents" badge="12" />
            <flr-sidebar-item label="Runs" badge="3" />
            <flr-sidebar-item label="Schedules" />
          </flr-sidebar-section>
          <flr-sidebar-section title="Settings">
            <flr-sidebar-item label="Members" />
            <flr-sidebar-item label="Billing" />
            <flr-sidebar-item label="Danger zone" [danger]="true" />
            <flr-sidebar-item label="Archived" [disabled]="true" />
          </flr-sidebar-section>
        </flr-sidebar>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<SidebarComponent>;

export const Default: Story = {};

export const Collapsed: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="height:520px; display:flex; background:var(--color-paper)">
        <flr-sidebar [width]="width" [collapsedWidth]="collapsedWidth" [collapsed]="true">
          <flr-sidebar-section [collapsed]="true">
            <flr-sidebar-item label="Overview" [active]="true" [collapsed]="true" />
            <flr-sidebar-item label="Agents" badge="12" [collapsed]="true" />
            <flr-sidebar-item label="Runs" [collapsed]="true" />
          </flr-sidebar-section>
        </flr-sidebar>
      </div>`,
  }),
};
