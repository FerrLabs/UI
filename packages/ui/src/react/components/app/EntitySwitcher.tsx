import type { ReactNode } from 'react';
import {
  ProjectSwitcher,
  type ProjectSwitcherItem,
  type ProjectSwitcherPlaceholder,
  type ProjectSwitcherProps,
} from './ProjectSwitcher.js';

export type EntitySwitcherItem = ProjectSwitcherItem;
export type EntitySwitcherPlaceholder = ProjectSwitcherPlaceholder;

export interface EntitySwitcherProps extends Omit<
  ProjectSwitcherProps,
  'triggerEyebrow' | 'title' | 'searchPlaceholder' | 'createLabel' | 'viewAllLabel'
> {
  /**
   * The kind of entity this switcher manages — e.g. `Vault`, `Site`, `Project`,
   * `Workspace`. Rendered as the eyebrow caption on the trigger card and used
   * to derive sensible default labels for the panel header, search placeholder,
   * Create button, and View-all link. Required — that's the whole point of
   * `EntitySwitcher` vs `ProjectSwitcher` (which leaves the eyebrow optional).
   */
  kind: string;
  /** Override the auto-derived panel header (default: `Switch ${kind}`). */
  title?: string;
  /** Override the auto-derived search placeholder (default: `Search ${kind.toLowerCase()}s…`). */
  searchPlaceholder?: string;
  /** Override the auto-derived Create button label (default: `Create ${kind.toLowerCase()}`). */
  createLabel?: string;
  /** Override the auto-derived View-all link label (default: `View all ${kind.toLowerCase()}s`). */
  viewAllLabel?: string;
}

/**
 * Semantic alias of `ProjectSwitcher` for the per-product entity slot in the
 * app sidebar (vault, site, project, workspace). Forces the eyebrow caption
 * via the required `kind` prop and stamps sensible default labels everywhere
 * (title / search / create / view-all) — set any of those to override.
 *
 * Use this when wiring the chrome of a product app. Reach for `ProjectSwitcher`
 * directly only when you need an unlabelled trigger (e.g. an org picker —
 * that's what `OrgSwitcher` does).
 *
 * Internally a thin wrapper around `ProjectSwitcher` — same dropdown, same
 * keyboard shortcut, same `renderTrigger` escape hatch.
 */
export function EntitySwitcher({
  kind,
  title,
  searchPlaceholder,
  createLabel,
  viewAllLabel,
  ...rest
}: EntitySwitcherProps) {
  const lower = kind.toLowerCase();
  return (
    <ProjectSwitcher
      {...rest}
      triggerEyebrow={kind as ReactNode}
      title={title ?? `Switch ${lower}`}
      searchPlaceholder={searchPlaceholder ?? `Search ${lower}s…`}
      createLabel={createLabel ?? `Create ${lower}`}
      viewAllLabel={viewAllLabel ?? `View all ${lower}s`}
    />
  );
}
