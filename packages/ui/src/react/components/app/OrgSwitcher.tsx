import {
  ProjectSwitcher,
  type ProjectSwitcherItem,
  type ProjectSwitcherPlaceholder,
  type ProjectSwitcherProps,
} from './ProjectSwitcher.js';

export type OrgSwitcherItem = ProjectSwitcherItem;
export type OrgSwitcherPlaceholder = ProjectSwitcherPlaceholder;

export interface OrgSwitcherProps extends Omit<
  ProjectSwitcherProps,
  'title' | 'searchPlaceholder' | 'createLabel' | 'viewAllLabel'
> {
  title?: string;
  searchPlaceholder?: string;
  createLabel?: string;
  viewAllLabel?: string;
}

export function OrgSwitcher({
  title = 'Switch organization',
  searchPlaceholder = 'Search organizations…',
  createLabel = 'Create organization',
  viewAllLabel = 'View all organizations',
  ...rest
}: OrgSwitcherProps) {
  return (
    <ProjectSwitcher
      title={title}
      searchPlaceholder={searchPlaceholder}
      createLabel={createLabel}
      viewAllLabel={viewAllLabel}
      {...rest}
    />
  );
}
