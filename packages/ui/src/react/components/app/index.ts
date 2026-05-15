/**
 * Product-app chrome — sidebar / topbar / page header / tag / stat / etc.
 * The canonical reference is `FerrLabs-Cloud/docs/design-bundle/app-shell.jsx`.
 *
 * Token contract — every component reads the following CSS custom properties
 * (provide them in your app's `global.css`, copy from
 * `FerrLabs-Cloud/docs/design-bundle/_app-base.css`):
 *
 *   --color-bg, --color-bg-2, --color-card,
 *   --color-app-sidebar, --color-app-nav-active, --color-app-nav-hover,
 *   --color-fg, --color-fg-2, --color-fg-3,
 *   --color-rule, --color-rule-strong,
 *   --color-accent (for default Stat delta — overridable per-instance),
 *   --font-serif, --font-mono.
 */

export { Shell, type ShellProps, type NavGroup, type NavItem, type ShellAction } from './Shell';
export { LogoMark, type ProductSlug } from './LogoMark';
export {
  BrandDropdown,
  DEFAULT_APPS as BRAND_DROPDOWN_APPS,
  type BrandDropdownProps,
  type BrandDropdownApp,
  type BrandDropdownAppId,
} from './BrandDropdown';
export { OrgDropdown, type OrgDropdownProps, type OrgDropdownItem } from './OrgDropdown';
export { SiteFavicon, type SiteFaviconProps } from './SiteFavicon';
export { SiteCard, type SiteCardProps } from './SiteCard';
export {
  ProjectSwitcher,
  type ProjectSwitcherProps,
  type ProjectSwitcherItem,
  type ProjectSwitcherPlaceholder,
} from './ProjectSwitcher';
export {
  OrgSwitcher,
  type OrgSwitcherProps,
  type OrgSwitcherItem,
  type OrgSwitcherPlaceholder,
} from './OrgSwitcher';
/** @deprecated Renamed to `ProjectSwitcher`. Will be removed in a future major. */
export { ProjectSwitcher as SiteSwitcher } from './ProjectSwitcher';
/** @deprecated Renamed to `ProjectSwitcherProps`. Will be removed in a future major. */
export type { ProjectSwitcherProps as SiteSwitcherProps } from './ProjectSwitcher';
/** @deprecated Renamed to `ProjectSwitcherItem`. Will be removed in a future major. */
export type { ProjectSwitcherItem as SiteSwitcherItem } from './ProjectSwitcher';
/** @deprecated Renamed to `ProjectSwitcherPlaceholder`. Will be removed in a future major. */
export type { ProjectSwitcherPlaceholder as SiteSwitcherPlaceholder } from './ProjectSwitcher';
export { Icon, type IconProps, type IconName } from './Icon';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
/** @deprecated Renamed to `Button`. Will be removed in a future major. */
export { Button as AppButton } from './Button';
export { Avatar, type AvatarSize, type AvatarShape } from './Avatar';
export { UserMenu, type UserMenuProps, type UserMenuItem } from './UserMenu';
export { CommandHint } from './CommandHint';
export { PageHeader, type BreadcrumbCrumb } from './PageHeader';
export { Stat } from './Stat';
export { Tag, type TagVariant, type TagSize } from './Tag';
