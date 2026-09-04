import { TabComponent, TabsComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<TabsComponent> = {
  title: 'App chrome/Tabs',
  component: TabsComponent,
  decorators: [moduleMetadata({ imports: [TabsComponent, TabComponent] })],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<TabsComponent>;

/**
 * One URL per view. Each tab is a real `<a>`, so cmd-click and middle-click open
 * a tab; a plain click is reported through `selected` for the router to handle.
 */
export const NavLinks: Story = {
  render: () => ({
    props: { current: 'list' },
    template: `
      <flr-tabs ariaLabel="Project views">
        <flr-tab
          label="List"
          href="/projects/ferrgames"
          [active]="current === 'list'"
          (selected)="current = 'list'"
        />
        <flr-tab
          label="Board"
          href="/projects/ferrgames/board"
          [active]="current === 'board'"
          (selected)="current = 'board'"
        />
        <flr-tab
          label="Settings"
          href="/projects/ferrgames/settings"
          [active]="current === 'settings'"
          (selected)="current = 'settings'"
        />
      </flr-tabs>`,
  }),
};

/** With a page title above, the shape every product detail page lands on. */
export const UnderAPageTitle: Story = {
  render: () => ({
    props: { current: 'settings' },
    template: `
      <div style="padding:24px 0">
        <h1 style="margin:0 0 16px;font-size:28px;color:var(--color-fg)">FerrGames</h1>
        <flr-tabs ariaLabel="Project views">
          <flr-tab label="List" href="/p/ferrgames" [active]="current === 'list'" (selected)="current = 'list'" />
          <flr-tab label="Board" href="/p/ferrgames/board" [active]="current === 'board'" (selected)="current = 'board'" />
          <flr-tab label="Settings" href="/p/ferrgames/settings" [active]="current === 'settings'" (selected)="current = 'settings'" />
        </flr-tabs>
      </div>`,
  }),
};

/**
 * Panel mode swaps a region of the same page: `tablist` semantics, roving
 * tabindex, and arrow keys moving between tabs. Counts sit beside the label.
 */
export const PanelsWithCounts: Story = {
  render: () => ({
    props: { current: 'secrets' },
    template: `
      <flr-tabs mode="panel" ariaLabel="Vault contents">
        <flr-tab
          label="Secrets"
          [count]="18"
          panelId="panel-secrets"
          [active]="current === 'secrets'"
          (selected)="current = 'secrets'"
        />
        <flr-tab
          label="Requests"
          [count]="3"
          panelId="panel-requests"
          [active]="current === 'requests'"
          (selected)="current = 'requests'"
        />
        <flr-tab
          label="People"
          panelId="panel-people"
          [active]="current === 'people'"
          (selected)="current = 'people'"
        />
        <flr-tab
          label="Audit"
          panelId="panel-audit"
          [active]="current === 'audit'"
          (selected)="current = 'audit'"
        />
      </flr-tabs>

      @for (id of ['secrets', 'requests', 'people', 'audit']; track id) {
        <div
          role="tabpanel"
          [id]="'panel-' + id"
          [hidden]="current !== id"
          style="padding:20px 0;color:var(--color-fg-2);font-size:14px"
        >
          {{ id }} panel
        </div>
      }`,
  }),
};

/** A tab the org cannot reach yet. It stays visible and out of the tab order. */
export const WithDisabled: Story = {
  render: () => ({
    props: { current: 'overview' },
    template: `
      <flr-tabs mode="panel" ariaLabel="Site sections">
        <flr-tab label="Overview" panelId="p1" [active]="current === 'overview'" (selected)="current = 'overview'" />
        <flr-tab label="Pages" [count]="7" panelId="p2" [active]="current === 'pages'" (selected)="current = 'pages'" />
        <flr-tab label="Analytics" panelId="p3" [disabled]="true" />
      </flr-tabs>
      @for (id of ['overview', 'pages']; track id) {
        <div role="tabpanel" [id]="id === 'overview' ? 'p1' : 'p2'" [hidden]="current !== id" style="padding:20px 0;color:var(--color-fg-2);font-size:14px">
          {{ id }} panel
        </div>
      }
      <div role="tabpanel" id="p3" hidden></div>`,
  }),
};

/** Enough tabs to overflow a narrow container: the strip scrolls, it never wraps. */
export const Overflowing: Story = {
  render: () => ({
    props: { current: 'runs' },
    template: `
      <div style="max-width:340px;border:1px dashed var(--color-rule);padding:12px">
        <flr-tabs mode="panel" ariaLabel="Agent sections">
          <flr-tab label="Runs" [count]="128" [active]="current === 'runs'" (selected)="current = 'runs'" />
          <flr-tab label="Schedules" [active]="current === 'schedules'" (selected)="current = 'schedules'" />
          <flr-tab label="Transcripts" [active]="current === 'transcripts'" (selected)="current = 'transcripts'" />
          <flr-tab label="Permissions" [active]="current === 'permissions'" (selected)="current = 'permissions'" />
          <flr-tab label="Danger zone" [active]="current === 'danger'" (selected)="current = 'danger'" />
        </flr-tabs>
      </div>`,
  }),
};
