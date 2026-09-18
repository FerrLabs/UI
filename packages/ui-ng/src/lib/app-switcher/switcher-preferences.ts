const HIDDEN_APPS_KEY = 'hiddenApps';

export function hiddenAppsFromPreferences(
  preferences: Readonly<Record<string, unknown>> | null | undefined,
): string[] {
  const value = preferences?.[HIDDEN_APPS_KEY];
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
}

export function withHiddenApps(
  preferences: Readonly<Record<string, unknown>> | null | undefined,
  hidden: readonly string[],
): Record<string, unknown> {
  return { ...preferences, [HIDDEN_APPS_KEY]: [...hidden] };
}
