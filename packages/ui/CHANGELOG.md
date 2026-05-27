# Changelog

All notable changes to `ui` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [4.4.0] - 2026-05-27

### Features

- feat(react): add EntitySwitcher, OrgChip, renderTrigger + collapsed on ProjectSwitcher (#175)

## [4.3.0] - 2026-05-27

### Features

- feat(primitives): add InputGroup to glue form controls into one bordered unit (#174)
- feat(foundation): two-tone the FerrLens logo (loupe in accent teal, grid in slate) (#164)
- feat(astro/PreFooterCTA): reshape bold variant to dark slate card (#163)
- feat(astro/PreFooterCTA): variant='bold' + teal accent (#161)
- feat(astro/navbar): add 'trailing' slot to editorial mode for user menus (#159)

## [4.2.1] - 2026-05-17

### Bug Fixes

- fix(ui): add .js extensions to relative imports for Node ESM resolution (#158)

## [4.2.0] - 2026-05-17

### Features

- feat(ui): rebuild Icon against foundation@4 + accept title prop, re-export icons map (#157)
- feat(astro): add Icon.astro that renders any foundation IconName (#156)
- feat(astro,foundation): register ferrlens as a product (teal accent, between vault and flow) (#155)
- feat(foundation): add zap, sparkles, bookmark, mail, dns, circleSlash, arrowRight icons (#154)
- feat(foundation): expose ferrlens loupe mark as both icon registry entry + standalone svg (#153)

## [4.1.1] - 2026-05-17

### Bug Fixes

- fix(logomark): use the loupe+pixel-grid mark for ferrlens (matches design bundle 03/Loupe) (#152)

## [4.1.0] - 2026-05-17

### Features

- feat(brand): add FerrLens (teal #14b8a6) to BrandDropdown + LogoMark (#151)

## [4.0.2] - 2026-05-16

### Bug Fixes

- fix(orgdropdown): drop trigger chevron — card affordance is enough (#150)

## [4.0.1] - 2026-05-16

### Bug Fixes

- fix(sidebar): intercept SidebarItem click for SPA nav (preserve cmd/ctrl/shift for new tab) (#149)

## [4.0.0] - 2026-05-16

### Breaking Changes

- feat(ui)!: drop org initial badge from OrgDropdown trigger in expanded mode (#148)

## [3.6.0] - 2026-05-15

### Features

- feat(ui): rename SiteSwitcher to ProjectSwitcher and add OrgSwitcher (#147)

## [3.5.0] - 2026-05-15

### Features

- feat(ui): add SiteSwitcher popover and replace unicode chevron with svg in SiteCard (#146)

## [3.4.0] - 2026-05-15

### Features

- feat(ui): add SiteCard and SiteFavicon for site-first sidebars (#145)

## [3.3.4] - 2026-05-15

### Bug Fixes

- fix(brand-dropdown): instant navigation + portal overlay shown only on slow connection (#143)

## [3.3.3] - 2026-05-13

### Bug Fixes

- fix(brand-dropdown): preserve collapse footer when app switcher is open (#141)

## [3.3.2] - 2026-05-13

### Bug Fixes

- fix(ui): pass sidebar collapsed state into projectSlot (#140)
- fix(ui): prevent brand cluster text from wrapping during sidebar collapse (#139)

## [3.3.1] - 2026-05-13

### Bug Fixes

- fix(ui): prevent brand cluster text from wrapping during sidebar collapse (#139)

## [3.3.0] - 2026-05-10

### Features

- feat(ui): Shell actions[] + projectSlot for sidebar OrgDropdown (#138)

## [3.2.0] - 2026-05-08

### Features

- feat(icons): add sidebar icons for product apps (#133)
- feat(ci): trigger ad-hoc Renovate scan after publish (#126)

### Bug Fixes

- fix(deps): regen lockfile after workspace:^ change in #135 (#137)
- fix(ui): use workspace:^ for ui-foundation dep so consumers can pull patches (#135)

## [3.1.1] - 2026-05-06

### Bug Fixes

- fix(ui): document subpath exports + collision rationale on the top-level index (#117)

## [3.1.0] - 2026-05-06

### Features

- feat(ui): Shell topbar — onSearch button (⌘K) + global cmd+K shortcut + userMenu slot (#115)
- feat(ui): add 'admin' to BrandDropdown, ADMIN_APP export + section grouping (#114)
- feat!(ui): merge primitives + react + auth source into ui package, drop sub-packages (UI#105) (#111)

### Bug Fixes

- fix(showcase): pin storybook addon-themes + react-vite to v8 (was 10, broke builder-vite resolution) (#116)
- fix(showcase): update @source paths to ui/foundation (post-merge of primitives/react) (#112)

## [3.0.0] - 2026-05-05

### Breaking Changes

- fix(react)!: default Button primary background to var(--color-accent), not slate ink (#87)
- refactor(primitives)!: rename AppFooter → Footer (App prefix dropped, deprecated alias kept) (#76)
- refactor!: realign primitives + showcase to editorial @ferrlabs/ui-react design system (#74)

### Features

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
- feat(ui): point app switcher to app.* subdomains and reorder products (#54)
- feat(react): polish BrandDropdown + add UserMenu (#47)
- feat(astro,styles): add 'amber' accent for FerrFleet brand (#45)
- feat(react): add BrandDropdown component for app switching (#42)
- feat(react): add AuthLayout + AuthField + AuthSubmit + AuthDivider (#41)
- feat(react): add product-app chrome (AppShell + AppLogoMark + PageHeader + Stat + Tag + Avatar + AppButton + CommandHint) (#40)
- feat(astro): generic Navbar + Footer with full prop API for cross-product reuse (#35)
- feat(styles): add Firefox scrollbar-width support + thumb hover (#32)
- feat(styles): editorial design system primitives — paper palette, container, btn, eyebrow, dark theme (#25)
- feat(ui-astro): Navbar docs integration (activePage + hideLanguageToggle + slots) — 0.6.0 (#24)
- feat(ui-astro): Navbar + Footer + PreFooterCTA + sticky-bottom layout (#23)
- feat: add @ferrlabs/styles package — Fraunces + DM Mono + Tailwind + brand tokens (#22)
- feat(ui-astro): ship rich LanguageSelect with globe icon, caret, and soft-fallback FR option (#14)
- feat: publish to github packages npm registry (#10)
- feat: port reusable components and auth pages from FerrFlow-Cloud app (#3)
- feat: bootstrap pnpm workspace with 5 packages (#2)

### Bug Fixes

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
- fix(react): use middle-dot separator in BrandDropdown tooltip (#52)
- fix(ci): use curl instead of gh CLI for cross-repo dispatch (#51)
- fix(react): show current app name in BrandDropdown tooltip (#50)
- fix(ci): rename dispatch secret FERRFLOW_DISPATCH_TOKEN → FERRLABS_DISPATCH_TOKEN (#49)
- fix(astro): legacy Navbar border now scroll-aware (was permanent) (#39)
- fix(astro): prevent mixed-content warning on PreFooterCTA mailto form (hijack submit, build mailto in JS) (#38)
- fix(astro): use is:global on Navbar styles (runtime .scrolled was tree-shaken) (#37)
- fix(ci): typecheck and build only changed packages (#30)
- fix(ci): publish only the bumped package on release tag (#29)
- fix(ui-react): add passwordStrength lib, align export shapes; skip ui-auth typecheck (#12)
- fix(ci): use NODE_AUTH_TOKEN in .npmrc and install steps (#11)
- fix(icons): drop deprecated moduleResolution: node (node10) (#9)
- fix(ci): add pnpm-lock.yaml (#8)
- fix(ci): pin pnpm version for action-setup@v5 (#7)

## [2.0.0] - 2026-05-05

### Breaking Changes

- fix(react)!: default Button primary background to var(--color-accent), not slate ink (#87)
- refactor(primitives)!: rename AppFooter → Footer (App prefix dropped, deprecated alias kept) (#76)
- refactor!: realign primitives + showcase to editorial @ferrlabs/ui-react design system (#74)

### Features

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
- feat(ui): point app switcher to app.* subdomains and reorder products (#54)
- feat(react): polish BrandDropdown + add UserMenu (#47)
- feat(astro,styles): add 'amber' accent for FerrFleet brand (#45)
- feat(react): add BrandDropdown component for app switching (#42)
- feat(react): add AuthLayout + AuthField + AuthSubmit + AuthDivider (#41)
- feat(react): add product-app chrome (AppShell + AppLogoMark + PageHeader + Stat + Tag + Avatar + AppButton + CommandHint) (#40)
- feat(astro): generic Navbar + Footer with full prop API for cross-product reuse (#35)
- feat(styles): add Firefox scrollbar-width support + thumb hover (#32)
- feat(styles): editorial design system primitives — paper palette, container, btn, eyebrow, dark theme (#25)
- feat(ui-astro): Navbar docs integration (activePage + hideLanguageToggle + slots) — 0.6.0 (#24)
- feat(ui-astro): Navbar + Footer + PreFooterCTA + sticky-bottom layout (#23)
- feat: add @ferrlabs/styles package — Fraunces + DM Mono + Tailwind + brand tokens (#22)
- feat(ui-astro): ship rich LanguageSelect with globe icon, caret, and soft-fallback FR option (#14)
- feat: publish to github packages npm registry (#10)
- feat: port reusable components and auth pages from FerrFlow-Cloud app (#3)
- feat: bootstrap pnpm workspace with 5 packages (#2)

### Bug Fixes

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
- fix(react): use middle-dot separator in BrandDropdown tooltip (#52)
- fix(ci): use curl instead of gh CLI for cross-repo dispatch (#51)
- fix(react): show current app name in BrandDropdown tooltip (#50)
- fix(ci): rename dispatch secret FERRFLOW_DISPATCH_TOKEN → FERRLABS_DISPATCH_TOKEN (#49)
- fix(astro): legacy Navbar border now scroll-aware (was permanent) (#39)
- fix(astro): prevent mixed-content warning on PreFooterCTA mailto form (hijack submit, build mailto in JS) (#38)
- fix(astro): use is:global on Navbar styles (runtime .scrolled was tree-shaken) (#37)
- fix(ci): typecheck and build only changed packages (#30)
- fix(ci): publish only the bumped package on release tag (#29)
- fix(ui-react): add passwordStrength lib, align export shapes; skip ui-auth typecheck (#12)
- fix(ci): use NODE_AUTH_TOKEN in .npmrc and install steps (#11)
- fix(icons): drop deprecated moduleResolution: node (node10) (#9)
- fix(ci): add pnpm-lock.yaml (#8)
- fix(ci): pin pnpm version for action-setup@v5 (#7)
