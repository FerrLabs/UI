export type AccessLevel = 'read' | 'write' | 'admin';

export type AccessPresetId = 'read_only' | 'read_write' | 'full';

export interface AccessOrg {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface AccessScope {
  readonly scope: string;
  readonly access: AccessLevel;
}

export interface AccessProduct {
  readonly product: string;
  readonly label: string;
  readonly scopes: readonly AccessScope[];
}

export interface AccessPreset {
  readonly id: AccessPresetId;
  readonly scopes: readonly string[];
}

export interface AccessSelection {
  readonly orgIds: string[] | null;
  readonly scopes: string[];
}

export interface AccessPickerLabels {
  readonly orgsTitle: string;
  readonly allOrgs: string;
  readonly someOrgs: string;
  readonly noOrgPicked: string;
  readonly scopesTitle: string;
  readonly presetsLabel: string;
  readonly noScopePicked: string;
  readonly presetReadOnly: string;
  readonly presetReadWrite: string;
  readonly presetFull: string;
}

export const ACCESS_PICKER_LABELS_EN: AccessPickerLabels = {
  orgsTitle: 'Organizations',
  allOrgs: 'All my organizations, including future ones',
  someOrgs: 'Only these organizations',
  noOrgPicked: 'Pick at least one organization.',
  scopesTitle: 'Permissions',
  presetsLabel: 'Presets',
  noScopePicked: 'Pick at least one permission.',
  presetReadOnly: 'Read only',
  presetReadWrite: 'Read and write',
  presetFull: 'Full access',
};

export const ACCESS_PICKER_LABELS_FR: AccessPickerLabels = {
  orgsTitle: 'Organisations',
  allOrgs: 'Toutes mes organisations, y compris les futures',
  someOrgs: 'Uniquement ces organisations',
  noOrgPicked: 'Choisissez au moins une organisation.',
  scopesTitle: 'Autorisations',
  presetsLabel: 'Préréglages',
  noScopePicked: 'Choisissez au moins une autorisation.',
  presetReadOnly: 'Lecture seule',
  presetReadWrite: 'Lecture et écriture',
  presetFull: 'Accès complet',
};

export function buildAccessSelection(
  allOrgs: boolean,
  pickedOrgs: ReadonlySet<string>,
  pickedScopes: ReadonlySet<string>,
): AccessSelection | null {
  const scopes = [...pickedScopes].sort();
  const orgIds = allOrgs ? null : [...pickedOrgs].sort();
  if (scopes.length === 0 || (orgIds !== null && orgIds.length === 0)) return null;
  return { orgIds, scopes };
}

export function matchingPreset(
  presets: readonly AccessPreset[],
  picked: ReadonlySet<string>,
): AccessPresetId | null {
  const match = presets.find(
    (p) => p.scopes.length === picked.size && p.scopes.every((s) => picked.has(s)),
  );
  return match?.id ?? null;
}

export function initialScopeSet(
  initial: readonly string[],
  catalogue: readonly AccessProduct[],
  presets: readonly AccessPreset[],
): ReadonlySet<string> {
  const known = new Set(catalogue.flatMap((p) => p.scopes.map((s) => s.scope)));
  const wanted = initial.filter((s) => known.has(s));
  const readOnly = presets.find((p) => p.id === 'read_only')?.scopes ?? [];
  return new Set(wanted.length > 0 ? wanted : readOnly);
}

export function toggled(current: ReadonlySet<string>, value: string): ReadonlySet<string> {
  const next = new Set(current);
  if (!next.delete(value)) next.add(value);
  return next;
}
