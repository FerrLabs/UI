import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Combobox, type ComboboxOption } from '../../../primitives.js';

export interface AsyncOrgOption {
  id: string;
  /** Display name. Falls back to `id` if empty. */
  name: string;
  /** Caller-supplied secondary line (e.g. slug, billing plan). */
  meta?: ReactNode;
  /**
   * Per-org role of the current user. Used by the optional `adminOnly` prop
   * to filter the list down to orgs where the user can perform admin actions
   * (e.g. "Transfer this vault to another org").
   */
  role?: 'admin' | 'member' | 'viewer';
}

export interface AsyncOrgSelectProps {
  /**
   * Loader. Called once on mount. Should return the orgs the current user
   * has access to. Wire to your app's `api.orgs.list()` (or equivalent).
   */
  loadOrgs: () => Promise<AsyncOrgOption[]>;
  value: string | null;
  onChange: (orgId: string | null) => void;
  /** Hide non-admin orgs from the list. Used in admin-only flows like "change org". */
  adminOnly?: boolean;
  placeholder?: string;
  emptyMessage?: ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Combobox that lazily loads the current user's orgs and lets them pick one.
 * Wraps `Combobox` from the primitives layer and adds the async fetch +
 * loading / error / empty states + optional role-based filtering.
 *
 * Typical use case: the "Change organization" modal on an entity-settings
 * page (transfer a vault / site / project to another org the user is admin
 * on).
 */
export function AsyncOrgSelect({
  loadOrgs,
  value,
  onChange,
  adminOnly = false,
  placeholder = 'Search organizations…',
  emptyMessage,
  className,
  disabled = false,
}: AsyncOrgSelectProps) {
  const [orgs, setOrgs] = useState<AsyncOrgOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    loadOrgs()
      .then((rows) => {
        if (!cancelled) setOrgs(rows);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setOrgs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [loadOrgs]);

  const options: ComboboxOption[] = useMemo(() => {
    if (!orgs) return [];
    return orgs
      .filter((o) => (adminOnly ? o.role === 'admin' : true))
      .map((o) => ({
        value: o.id,
        label: o.name || o.id,
        hint: o.meta ?? undefined,
        searchText: `${o.name} ${o.id}`,
      }));
  }, [orgs, adminOnly]);

  const isLoading = orgs === null && error === null;

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled || isLoading}
      className={className}
      emptyMessage={
        error ? `Couldn't load organizations: ${error}` : (emptyMessage ?? 'No organizations.')
      }
    />
  );
}
