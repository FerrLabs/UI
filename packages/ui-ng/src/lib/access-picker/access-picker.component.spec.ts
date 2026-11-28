import '@angular/compiler';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createComponent, flushEffects } from '../testing/component-harness';
import { AccessPickerComponent } from './access-picker.component';
import {
  ACCESS_PICKER_LABELS_EN,
  ACCESS_PICKER_LABELS_FR,
  type AccessOrg,
  type AccessPreset,
  type AccessProduct,
  type AccessSelection,
} from './access-picker.model';

interface Internals {
  allOrgs(): boolean;
  pickedOrgs(): ReadonlySet<string>;
  pickedScopes(): ReadonlySet<string>;
  activePreset(): string | null;
  useAllOrgs(): void;
  useChosenOrgs(): void;
  toggleOrg(id: string): void;
  toggleScope(scope: string): void;
  applyPreset(preset: AccessPreset): void;
  presetLabel(id: 'read_only' | 'read_write' | 'full'): string;
}

const ORGS: readonly AccessOrg[] = [
  { id: 'o1', name: 'One', slug: 'one' },
  { id: 'o2', name: 'Two', slug: 'two' },
];

const CATALOGUE: readonly AccessProduct[] = [
  {
    product: 'vault',
    label: 'Vault',
    scopes: [
      { scope: 'vault:read', access: 'read' },
      { scope: 'vault:write', access: 'write' },
    ],
  },
];

const PRESETS: readonly AccessPreset[] = [
  { id: 'read_only', scopes: ['vault:read'] },
  { id: 'full', scopes: ['vault:read', 'vault:write'] },
];

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(AccessPickerComponent, {
    orgs: ORGS,
    catalogue: CATALOGUE,
    presets: PRESETS,
    initialScopes: [],
    labels: ACCESS_PICKER_LABELS_EN,
    ...inputs,
  });
  const emitted: (AccessSelection | null)[] = [];
  component.selectionChange.subscribe((value) => emitted.push(value));
  flushEffects(component);
  return { component, internals: component as unknown as Internals, emitted };
}

describe('AccessPickerComponent', () => {
  it('starts on all organizations with the read only preset and emits it', () => {
    const { internals, emitted } = setup();
    expect(internals.allOrgs()).toBe(true);
    expect(internals.activePreset()).toBe('read_only');
    expect(emitted.at(-1)).toEqual({ orgIds: null, scopes: ['vault:read'] });
  });

  it('starts from valid initial scopes instead of the preset', () => {
    const { internals, emitted } = setup({ initialScopes: ['vault:write', 'bogus'] });
    expect([...internals.pickedScopes()]).toEqual(['vault:write']);
    expect(internals.activePreset()).toBeNull();
    expect(emitted.at(-1)?.scopes).toEqual(['vault:write']);
  });

  it('emits null while choosing organizations with none picked', () => {
    const { component, internals, emitted } = setup();
    internals.useChosenOrgs();
    flushEffects(component);
    expect(emitted.at(-1)).toBeNull();
  });

  it('emits the sorted picked organizations and goes back to all', () => {
    const { component, internals, emitted } = setup();
    internals.useChosenOrgs();
    internals.toggleOrg('o2');
    internals.toggleOrg('o1');
    flushEffects(component);
    expect(emitted.at(-1)).toEqual({ orgIds: ['o1', 'o2'], scopes: ['vault:read'] });
    internals.toggleOrg('o2');
    flushEffects(component);
    expect(emitted.at(-1)?.orgIds).toEqual(['o1']);
    internals.useAllOrgs();
    flushEffects(component);
    expect(emitted.at(-1)?.orgIds).toBeNull();
  });

  it('toggling scopes updates the active preset and the selection', () => {
    const { component, internals, emitted } = setup();
    internals.toggleScope('vault:write');
    flushEffects(component);
    expect(internals.activePreset()).toBe('full');
    expect(emitted.at(-1)?.scopes).toEqual(['vault:read', 'vault:write']);
    internals.toggleScope('vault:read');
    internals.toggleScope('vault:write');
    flushEffects(component);
    expect(emitted.at(-1)).toBeNull();
  });

  it('applyPreset replaces the picked scopes', () => {
    const { component, internals, emitted } = setup();
    internals.applyPreset(PRESETS[1]);
    flushEffects(component);
    expect(internals.activePreset()).toBe('full');
    expect(emitted.at(-1)?.scopes).toEqual(['vault:read', 'vault:write']);
  });

  it('resets the scopes when the initial scopes input changes', () => {
    const initialScopes = signal<readonly string[]>([]);
    const { internals } = setup({ initialScopes });
    internals.toggleScope('vault:write');
    expect([...internals.pickedScopes()]).toEqual(['vault:read', 'vault:write']);
    initialScopes.set(['vault:write']);
    expect([...internals.pickedScopes()]).toEqual(['vault:write']);
  });

  it('maps preset ids to the active labels', () => {
    const { internals } = setup();
    expect(internals.presetLabel('read_only')).toBe('Read only');
    expect(internals.presetLabel('read_write')).toBe('Read and write');
    expect(internals.presetLabel('full')).toBe('Full access');
    const french = setup({ labels: ACCESS_PICKER_LABELS_FR }).internals;
    expect(french.presetLabel('full')).toBe('Accès complet');
  });

  it('does not emit extra values without a change', () => {
    const listener = vi.fn();
    const { component } = setup();
    component.selectionChange.subscribe(listener);
    flushEffects(component);
    expect(listener).not.toHaveBeenCalled();
  });
});
