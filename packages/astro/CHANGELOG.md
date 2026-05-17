# Changelog

All notable changes to `astro` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.1.0] - 2026-05-17

### Features

- feat(astro): add Icon.astro that renders any foundation IconName (#156)

## [1.0.0] - 2026-05-17

### Breaking Changes

- feat(ui)!: drop org initial badge from OrgDropdown trigger in expanded mode (#148)
- fix(react)!: default Button primary background to var(--color-accent), not slate ink (#87)
- refactor(primitives)!: rename AppFooter → Footer (App prefix dropped, deprecated alias kept) (#76)
- refactor!: realign primitives + showcase to editorial @ferrlabs/ui-react design system (#74)

### Features

- feat(astro,foundation): register ferrlens as a product (teal accent, between vault and flow) (#155)
- feat(foundation): add zap, sparkles, bookmark, mail, dns, circleSlash, arrowRight icons (#154)
- feat(foundation): expose ferrlens loupe mark as both icon registry entry + standalone svg (#153)
- feat(brand): add FerrLens (teal #14b8a6) to BrandDropdown + LogoMark (#151)
- feat(ui): rename SiteSwitcher to ProjectSwitcher and add OrgSwitcher (#147)
- feat(ui): add SiteSwitcher popover and replace unicode chevron with svg in SiteCard (#146)
- feat(ui): add SiteCard and SiteFavicon for site-first sidebars (#145)
- feat(ui): Shell actions[] + projectSlot for sidebar OrgDropdown (#138)
- feat(icons): add sidebar icons for product apps (#133)
- feat(ci): trigger ad-hoc Renovate scan after publish (#126)
- feat(ui): Shell topbar — onSearch button (⌘K) + global cmd+K shortcut + userMenu slot (#115)
- feat(ui): add 'admin' to BrandDropdown, ADMIN_APP export + section grouping (#114)
- feat!(ui): merge primitives + react + auth source into ui package, drop sub-packages (UI#105) (#111)
- feat(ui): meta-package re-exporting primitives + react via subpath exports (UI#105 phase 1.2) (#107)
- feat(ui-foundation): merge icons + styles + tailwind into single package (UI#105) (#106)
- feat(primitives): add Sparkline component (#96)
- feat(primitives,react): smooth Sidebar collapse animations (#92)
- feat(react,primitives): add OrgDropdown + Sidebar projectSlot for org switching (#91)
- feat(primitives,showcase): wire Sidebar brand cell for BrandDropdown by default (#89)
- feat(primitives): Wave 8 menu/disclosure (Menu, Accordion, Breadcrumb, Chip, Code+CodeBlock) (#73)
- feat(primitives): Wave 7 specialized form (SearchField, Slider, FileUpload, Combobox, DatePicker, Stepper) (#72)
- feat(primitives): Wave 6 data display (DataTable, Pagination, KeyValue, StatCard, Timeline, ProgressBar) (#71)
- feat(primitives): Wave 5 layout (PageHeader, Navbar, Sidebar, AppFooter, Container, Divider) (#70)
- feat(primitives): Wave 4 display (Badge, Card, Skeleton, Spinner, EmptyState, Avatar, Tabs, Banner) (#69)
- feat(primitives): Wave 3 overlays (Modal, Drawer, Toast, Tooltip, Popover) + ToastProvider hook (#68)
- feat(primitives): Wave 2 form (Select, Checkbox, Switch, Radio, RadioGroup) + Button hover shadow + cursor across all (#67)
- feat(showcase): Storybook 8 + Wave 1 stories + 6-product theme switcher (Refs FerrLabs/UI#63) (#65)
- feat(primitives): add @ferrlabs/ui-primitives with Button, Field, Input, Textarea, Submit (Refs FerrLabs/UI#63) (#64)

### Bug Fixes

- fix(logomark): use the loupe+pixel-grid mark for ferrlens (matches design bundle 03/Loupe) (#152)
- fix(orgdropdown): drop trigger chevron — card affordance is enough (#150)
- fix(sidebar): intercept SidebarItem click for SPA nav (preserve cmd/ctrl/shift for new tab) (#149)
- fix(brand-dropdown): instant navigation + portal overlay shown only on slow connection (#143)
- fix(brand-dropdown): preserve collapse footer when app switcher is open (#141)
- fix(ui): pass sidebar collapsed state into projectSlot (#140)
- fix(ui): prevent brand cluster text from wrapping during sidebar collapse (#139)
- fix(deps): regen lockfile after workspace:^ change in #135 (#137)
- fix(ui): use workspace:^ for ui-foundation dep so consumers can pull patches (#135)
- fix(ui): document subpath exports + collision rationale on the top-level index (#117)
- fix(showcase): pin storybook addon-themes + react-vite to v8 (was 10, broke builder-vite resolution) (#116)
- fix(showcase): update @source paths to ui/foundation (post-merge of primitives/react) (#112)
- fix(ci/publish): include foundation + ui in publish matrix and FerrFlow versioning (#109)
- fix(ci): build all packages topologically (was missing ui-foundation + ui) (#108)
- fix(react): pin workspace primitives + icons via workspace:^ to avoid stale-version publish (#98)
- fix(ci): drop redundant build step from PR CI (#93)
- fix(ci): build library packages before showcase typecheck (#90)
- fix(react): scale FerrLabs LogoMark brackets to match Footer.astro ratio (was 86%, now 47%) (#88)
- fix(showcase): demo Sidebar with project switcher matching app-shell.jsx (#85)
- fix(primitives): Sidebar matches Shell pixel-near (Fraunces serif items, accent left bar, project switcher built-in) (#78)
- fix(showcase): wire @tailwindcss/vite into Storybook viteFinal so utilities compile (#66)
- fix(react): BrandDropdown hover area fills the full sidebar header height (#61)
- fix(react): keep AppShell project switcher visible (icon-only) when sidebar is collapsed (#59)
- fix(react): rebalance FerrLabs [FL] mark so the closing bracket no longer overlaps FL (#57)

## [0.12.0] - 2026-05-02

### Features

- feat(ui): point app switcher to app.* subdomains and reorder products (#54)

### Bug Fixes

- fix(react): use middle-dot separator in BrandDropdown tooltip (#52)
- fix(ci): use curl instead of gh CLI for cross-repo dispatch (#51)
- fix(react): show current app name in BrandDropdown tooltip (#50)
- fix(ci): rename dispatch secret FERRFLOW_DISPATCH_TOKEN → FERRLABS_DISPATCH_TOKEN (#49)

## [0.11.0] - 2026-05-02

### Features

- feat(react): polish BrandDropdown + add UserMenu (#47)

## [0.10.0] - 2026-05-02

### Features

- feat(astro,styles): add 'amber' accent for FerrFleet brand (#45)
- feat(react): add BrandDropdown component for app switching (#42)
- feat(react): add AuthLayout + AuthField + AuthSubmit + AuthDivider (#41)
- feat(react): add product-app chrome (AppShell + AppLogoMark + PageHeader + Stat + Tag + Avatar + AppButton + CommandHint) (#40)

## [0.9.3] - 2026-05-01

### Bug Fixes

- fix(astro): legacy Navbar border now scroll-aware (was permanent) (#39)

## [0.9.2] - 2026-05-01

### Bug Fixes

- fix(astro): prevent mixed-content warning on PreFooterCTA mailto form (hijack submit, build mailto in JS) (#38)

## [0.9.1] - 2026-05-01

### Bug Fixes

- fix(astro): use is:global on Navbar styles (runtime .scrolled was tree-shaken) (#37)

## [0.8.0] - 2026-05-01

### Features

- feat(astro): generic Navbar + Footer with full prop API for cross-product reuse (#35)
- feat(styles): add Firefox scrollbar-width support + thumb hover (#32)
- feat(styles): editorial design system primitives — paper palette, container, btn, eyebrow, dark theme (#25)

### Bug Fixes

- fix(ci): typecheck and build only changed packages (#30)
- fix(ci): publish only the bumped package on release tag (#29)

## [0.7.0] - 2026-05-01

### Features

- feat(ui-astro): generic Navbar + Footer with full prop API for cross-product reuse — editorial mode (hex accent, brandName/brandTag, navLinks, products chip strip, links.{resources,legal,about}, backToHolding) coexists with legacy product-aware mode for backward compat with FerrFlow docs (#34)

## [0.5.0] - 2026-04-23

### Features

- feat(ui-astro): Navbar + Footer + PreFooterCTA + sticky-bottom layout (#23)
- feat: add @ferrlabs/styles package — Fraunces + DM Mono + Tailwind + brand tokens (#22)

## [0.4.0] - 2026-04-23

### Features

- feat(ui-astro): ship rich LanguageSelect with globe icon, caret, and soft-fallback FR option (#14)

## [0.2.0] - 2026-04-23

### Features

- feat: publish to github packages npm registry (#10)
- feat: port reusable components and auth pages from FerrFlow-Cloud app (#3)
- feat: bootstrap pnpm workspace with 5 packages (#2)

### Bug Fixes

- fix(ui-react): add passwordStrength lib, align export shapes; skip ui-auth typecheck (#12)
- fix(ci): use NODE_AUTH_TOKEN in .npmrc and install steps (#11)
- fix(icons): drop deprecated moduleResolution: node (node10) (#9)
- fix(ci): add pnpm-lock.yaml (#8)
- fix(ci): pin pnpm version for action-setup@v5 (#7)
