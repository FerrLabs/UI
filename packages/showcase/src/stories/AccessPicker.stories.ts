import {
  AccessPickerComponent,
  type AccessOrg,
  type AccessPreset,
  type AccessProduct,
  type AccessSelection,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
  args: { orgs, catalogue, presets, initialScopes: [] },
  render: (args) => {
    const output = { text: 'pending' };
    return {
      props: {
        ...args,
        output,
        report: (value: AccessSelection | null) => (output.text = JSON.stringify(value)),
      },
      template: `<flr-access-picker
        [orgs]="orgs"
        [catalogue]="catalogue"
        [presets]="presets"
        [initialScopes]="initialScopes"
        (selectionChange)="report($event)"
      />
      <pre data-testid="selection">{{ output.text }}</pre>`,
    };
  },
};

export default meta;
type Story = StoryObj<AccessPickerComponent>;

async function expectLast(
  canvasElement: HTMLElement,
  expected: AccessSelection | null,
): Promise<void> {
  await waitFor(() =>
    expect(within(canvasElement).getByTestId('selection')).toHaveTextContent(
      JSON.stringify(expected),
    ),
  );
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectLast(canvasElement, {
      orgIds: null,
      scopes: ['flow:read', 'vault:read'],
    });
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Read only' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
  },
};

export const InitialScopes: Story = {
  args: { initialScopes: ['flow:write', 'unknown:scope'] },
  play: async ({ canvasElement }) => {
    await expectLast(canvasElement, {
      orgIds: null,
      scopes: ['flow:write'],
    });
  },
};

export const OnlyUnknownInitialScopesFallBackToReadOnly: Story = {
  args: { initialScopes: ['unknown:scope'] },
  play: async ({ canvasElement }) => {
    await expectLast(canvasElement, {
      orgIds: null,
      scopes: ['flow:read', 'vault:read'],
    });
  },
};

export const ChosenOrgsNeedAtLeastOne: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Only these organizations' }));
    await expectLast(canvasElement, null);
    await expect(await canvas.findByText('Pick at least one organization.')).toBeVisible();

    await userEvent.click(canvas.getByRole('checkbox', { name: /Globex/ }));
    await expectLast(canvasElement, {
      orgIds: ['org-2'],
      scopes: ['flow:read', 'vault:read'],
    });

    await userEvent.click(canvas.getByRole('radio', { name: /All my organizations/ }));
    await expectLast(canvasElement, {
      orgIds: null,
      scopes: ['flow:read', 'vault:read'],
    });
  },
};

export const PresetsAndManualToggles: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pressed = (name: string, value: string) =>
      waitFor(() =>
        expect(canvas.getByRole('button', { name })).toHaveAttribute('aria-pressed', value),
      );

    await userEvent.click(canvas.getByRole('button', { name: 'Full access' }));
    await expectLast(canvasElement, {
      orgIds: null,
      scopes: ['flow:admin', 'flow:read', 'flow:write', 'vault:read', 'vault:write'],
    });
    await pressed('Full access', 'true');

    await userEvent.click(canvas.getByRole('checkbox', { name: 'flow:admin' }));
    await pressed('Read and write', 'true');

    await userEvent.click(canvas.getByRole('checkbox', { name: 'vault:write' }));
    for (const name of ['Read only', 'Read and write', 'Full access']) {
      await pressed(name, 'false');
    }
  },
};

export const NoScopeEmitsNull: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'flow:read' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'vault:read' }));
    await expectLast(canvasElement, null);
    await expect(await canvas.findByText('Pick at least one permission.')).toBeVisible();
  },
};
