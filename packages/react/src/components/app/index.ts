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

export { AppShell, type AppShellProps, type NavGroup, type NavItem } from './AppShell';
export { AppLogoMark, type ProductSlug } from './AppLogoMark';
export { AppButton } from './AppButton';
export { Avatar } from './Avatar';
export { CommandHint } from './CommandHint';
export { PageHeader } from './PageHeader';
export { Stat } from './Stat';
export { Tag } from './Tag';
