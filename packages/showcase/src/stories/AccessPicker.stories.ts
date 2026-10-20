import {
  AccessPickerComponent,
  type AccessOrg,
  type AccessPreset,
  type AccessProduct,
  type AccessSelection,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';

const orgs: readonly AccessOrg[] = [
  { id: 'org-1', name: 'Acme', slug: 'acme' },
  { id: 'org-2', name: 'Globex', slug: 'globex' },
];

const catalogue: readonly AccessProduct[] = [
  {
    product: 'flow',
    label: 'FerrFlow',
    scopes: [
      { scope: 'flow:read', access: 'read' },
      { scope: 'flow:write', access: 'write' },
      { scope: 'flow:admin', access: 'admin' },
    ],
  },
  {
    product: 'vault',
    label: 'FerrVault',
    scopes: [
      { scope: 'vault:read', access: 'read' },
      { scope: 'vault:write', access: 'write' },
    ],
  },
];

const presets: readonly AccessPreset[] = [
  { id: 'read_only', scopes: ['flow:read', 'vault:read'] },
  { id: 'read_write', scopes: ['flow:read', 'flow:write', 'vault:read', 'vault:write'] },
  {
    id: 'full',
    scopes: ['flow:read', 'flow:write', 'flow:admin', 'vault:read', 'vault:write'],
  },
];

const meta: Meta<AccessPickerComponent> = {
  title: 'Forms/Access picker',
  component: AccessPickerComponent,
  decorators: [moduleMetadata({ imports: [AccessPickerComponent] })],
  args: { orgs, catalogue, presets, initialScopes: [], selectionChange: fn() },
  render: (args) => ({
    props: args,
    template: `<flr-access-picker
      [orgs]="orgs"
      [catalogue]="catalogue"
      [presets]="presets"
      [initialScopes]="initialScopes"
      (selectionChange)="selectionChange($event)"
    />`,
  }),
};

export default meta;
type Story = StoryObj<AccessPickerComponent>;

function lastEmission(spy: unknown): AccessSelection | null {
  const calls = (spy as ReturnType<typeof fn>).mock.calls;
  return calls[calls.length - 1][0] as AccessSelection | null;
}

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(lastEmission(args.selectionChange)).toEqual({
      orgIds: null,
      scopes: ['flow:read', 'vault:read'],
    });
    await expect(canvas.getByRole('button', { name: 'Read only' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

export const InitialScopes: Story = {
  args: { initialScopes: ['flow:write', 'unknown:scope'] },
  play: async ({ args }) => {
    await expect(lastEmission(args.selectionChange)).toEqual({
      orgIds: null,
      scopes: ['flow:write'],
    });
  },
};

export const OnlyUnknownInitialScopesFallBackToReadOnly: Story = {
  args: { initialScopes: ['unknown:scope'] },
  play: async ({ args }) => {
    await expect(lastEmission(args.selectionChange)).toEqual({
      orgIds: null,
      scopes: ['flow:read', 'vault:read'],
    });
  },
};

export const ChosenOrgsNeedAtLeastOne: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Only these organizations' }));
    await expect(lastEmission(args.selectionChange)).toBeNull();
    await expect(canvas.getByText('Pick at least one organization.')).toBeVisible();

    await userEvent.click(canvas.getByRole('checkbox', { name: /Globex/ }));
    await expect(lastEmission(args.selectionChange)).toEqual({
      orgIds: ['org-2'],
      scopes: ['flow:read', 'vault:read'],
    });

    await userEvent.click(canvas.getByRole('radio', { name: /All my organizations/ }));
    await expect(lastEmission(args.selectionChange)).toEqual({
      orgIds: null,
      scopes: ['flow:read', 'vault:read'],
    });
  },
};

export const PresetsAndManualToggles: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Full access' }));
    await expect(lastEmission(args.selectionChange)?.scopes).toEqual([
      'flow:admin',
      'flow:read',
      'flow:write',
      'vault:read',
      'vault:write',
    ]);
    await expect(canvas.getByRole('button', { name: 'Full access' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(canvas.getByRole('checkbox', { name: 'flow:admin' }));
    await expect(canvas.getByRole('button', { name: 'Read and write' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(canvas.getByRole('checkbox', { name: 'vault:write' }));
    for (const name of ['Read only', 'Read and write', 'Full access']) {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false');
    }
  },
};

export const NoScopeEmitsNull: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'flow:read' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'vault:read' }));
    await expect(lastEmission(args.selectionChange)).toBeNull();
    await expect(canvas.getByText('Pick at least one permission.')).toBeVisible();
  },
};
