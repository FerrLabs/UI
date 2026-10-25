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

const keyboardMap = [
  { code: 'Enter', key: 'Enter', keyCode: 13 },
  { code: 'Escape', key: 'Escape', keyCode: 27 },
  { code: 'End', key: 'End', keyCode: 35 },
  { code: 'Home', key: 'Home', keyCode: 36 },
  { code: 'ArrowUp', key: 'ArrowUp', keyCode: 38 },
  { code: 'ArrowDown', key: 'ArrowDown', keyCode: 40 },
];

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = within(canvasElement.ownerDocument.body);
    const user = userEvent.setup({ keyboardMap });
    const trigger = canvas.getByRole('button', { name: 'Actions' });

    trigger.focus();
    await user.keyboard('{Enter}');
    const first = await overlay.findByRole('menuitem', { name: 'Trigger now' });
    await waitFor(() => expect(first).toHaveFocus());

    await user.keyboard('{ArrowDown}');
    await expect(overlay.getByRole('menuitem', { name: 'Trigger with overrides' })).toHaveFocus();

    await user.keyboard('{End}');
    await expect(overlay.getByRole('menuitem', { name: 'Delete agent' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    await expect(first).toHaveFocus();

    await user.keyboard('{Home}{ArrowUp}');
    await expect(overlay.getByRole('menuitem', { name: 'Delete agent' })).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(overlay.queryByRole('menu')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};
