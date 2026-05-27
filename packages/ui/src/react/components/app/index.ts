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

export { Shell, type ShellProps, type NavGroup, type NavItem, type ShellAction } from './Shell.js';
export { LogoMark, type ProductSlug } from './LogoMark.js';
export {
  BrandDropdown,
  DEFAULT_APPS as BRAND_DROPDOWN_APPS,
  type BrandDropdownProps,
  type BrandDropdownApp,
  type BrandDropdownAppId,
} from './BrandDropdown.js';
export { OrgDropdown, type OrgDropdownProps, type OrgDropdownItem } from './OrgDropdown.js';
export { OrgChip, type OrgChipProps, type OrgChipItem } from './OrgChip.js';
export { AsyncOrgSelect, type AsyncOrgSelectProps, type AsyncOrgOption } from './AsyncOrgSelect.js';
export { SiteFavicon, type SiteFaviconProps } from './SiteFavicon.js';
export { SiteCard, type SiteCardProps } from './SiteCard.js';
export {
  ProjectSwitcher,
  type ProjectSwitcherProps,
  type ProjectSwitcherItem,
  type ProjectSwitcherPlaceholder,
} from './ProjectSwitcher.js';
export {
  OrgSwitcher,
  type OrgSwitcherProps,
  type OrgSwitcherItem,
  type OrgSwitcherPlaceholder,
} from './OrgSwitcher.js';
export {
  EntitySwitcher,
  type EntitySwitcherProps,
  type EntitySwitcherItem,
  type EntitySwitcherPlaceholder,
} from './EntitySwitcher.js';
/** @deprecated Renamed to `ProjectSwitcher`. Will be removed in a future major. */
export { ProjectSwitcher as SiteSwitcher } from './ProjectSwitcher.js';
/** @deprecated Renamed to `ProjectSwitcherProps`. Will be removed in a future major. */
export type { ProjectSwitcherProps as SiteSwitcherProps } from './ProjectSwitcher.js';
/** @deprecated Renamed to `ProjectSwitcherItem`. Will be removed in a future major. */
export type { ProjectSwitcherItem as SiteSwitcherItem } from './ProjectSwitcher.js';
/** @deprecated Renamed to `ProjectSwitcherPlaceholder`. Will be removed in a future major. */
export type { ProjectSwitcherPlaceholder as SiteSwitcherPlaceholder } from './ProjectSwitcher.js';
export { Icon, type IconProps, type IconName } from './Icon.js';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button.js';
/** @deprecated Renamed to `Button`. Will be removed in a future major. */
export { Button as AppButton } from './Button.js';
export { Avatar, type AvatarSize, type AvatarShape } from './Avatar.js';
export { UserMenu, type UserMenuProps, type UserMenuItem } from './UserMenu.js';
export { CommandHint } from './CommandHint.js';
export { PageHeader, type BreadcrumbCrumb } from './PageHeader.js';
export { Stat } from './Stat.js';
export { Tag, type TagVariant, type TagSize } from './Tag.js';
