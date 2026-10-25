import {
  ButtonComponent,
  MenuComponent,
  MenuItemComponent,
  MenuLabelComponent,
  MenuSeparatorComponent,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta: Meta<MenuComponent> = {
  title: 'Overlays/Menu',
  component: MenuComponent,
  decorators: [
    moduleMetadata({
      imports: [
        MenuComponent,
        MenuItemComponent,
        MenuSeparatorComponent,
        MenuLabelComponent,
        ButtonComponent,
      ],
    }),
  ],
  args: { align: 'start', minWidth: 220 },
  argTypes: { align: { control: 'inline-radio', options: ['start', 'end'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:16px">
        <flr-menu [align]="align" [minWidth]="minWidth">
          <flr-button flr-menu-trigger variant="ghost">Actions</flr-button>
          <ng-container flr-menu-content>
            <flr-menu-label>Run</flr-menu-label>
            <flr-menu-item>Trigger now</flr-menu-item>
            <flr-menu-item>Trigger with overrides</flr-menu-item>
            <flr-menu-separator />
            <flr-menu-label>Danger zone</flr-menu-label>
            <flr-menu-item [destructive]="true">Delete agent</flr-menu-item>
            <flr-menu-item [disabled]="true">Transfer ownership</flr-menu-item>
          </ng-container>
        </flr-menu>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<MenuComponent>;

export const Default: Story = {};

export const AlignEnd: Story = { args: { align: 'end' } };

const keyCodes: Record<string, number> = {
  Escape: 27,
  End: 35,
  Home: 36,
  ArrowUp: 38,
  ArrowDown: 40,
};

function press(key: string): void {
  document.activeElement?.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      keyCode: keyCodes[key],
      bubbles: true,
      cancelable: true,
    }),
  );
}

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Actions' });

    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const first = await overlay.findByRole('menuitem', { name: 'Trigger now' });
    await waitFor(() => expect(first).toHaveFocus());

    press('ArrowDown');
    await expect(overlay.getByRole('menuitem', { name: 'Trigger with overrides' })).toHaveFocus();

    press('End');
    await expect(overlay.getByRole('menuitem', { name: 'Delete agent' })).toHaveFocus();

    press('ArrowDown');
    await expect(first).toHaveFocus();

    press('Home');
    press('ArrowUp');
    await expect(overlay.getByRole('menuitem', { name: 'Delete agent' })).toHaveFocus();

    press('Escape');
    await waitFor(() => expect(overlay.queryByRole('menu')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};
