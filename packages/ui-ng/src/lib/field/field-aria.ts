export interface FieldIds {
  readonly fieldId: string;
  readonly labelId: string;
  readonly hintId: string;
  readonly errorId: string;
}

export function fieldIds(sequence: number): FieldIds {
  const fieldId = `flr-field-${sequence}`;
  return {
    fieldId,
    labelId: `${fieldId}-label`,
    hintId: `${fieldId}-hint`,
    errorId: `${fieldId}-error`,
  };
}

export function labelForTarget(group: boolean, ids: FieldIds): string | null {
  return group ? null : ids.fieldId;
}

export function mergeDescribedBy(
  existing: string | null,
  ownedIds: readonly string[],
  activeId: string | null,
): string | null {
  const tokens = (existing ?? '')
    .split(/\s+/)
    .filter((token) => token !== '' && !ownedIds.includes(token));
  if (activeId) {
    tokens.push(activeId);
  }
  return tokens.length > 0 ? tokens.join(' ') : null;
}
