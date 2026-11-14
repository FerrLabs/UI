export type ShellCrumb = string | { readonly label: string; readonly href?: string };

export interface ResolvedCrumb {
  readonly label: string;
  readonly href: string | null;
  readonly last: boolean;
}

export function resolveCrumbs(crumbs: readonly ShellCrumb[]): readonly ResolvedCrumb[] {
  return crumbs.map((crumb, index) => {
    const last = index === crumbs.length - 1;
    const label = typeof crumb === 'string' ? crumb : crumb.label;
    const href = typeof crumb === 'string' || last ? null : (crumb.href ?? null);
    return { label, href, last };
  });
}

export type ClickModifiers = Pick<
  MouseEvent,
  'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'
>;

export function isPlainLeftClick(event: ClickModifiers): boolean {
  return !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0;
}
