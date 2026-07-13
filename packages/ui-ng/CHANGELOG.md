# Changelog

All notable changes to `ui-ng` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.9.0] - 2026-07-13

### Features

- feat(ui-ng): make ComparisonTable cell aria-labels translatable (#292)

## [1.8.0] - 2026-07-13

### Features

- feat(ui-ng): add ComparisonTable for Why-<product> feature comparisons (#288)

## [1.7.0] - 2026-07-04

### Features

- feat(ui-ng): shell breadcrumb-lead slot + site-switcher showTriggerMeta toggle (#275)

## [1.6.0] - 2026-07-04

### Features

- feat(ui-ng): navbar site switcher component + breadcrumb-level shell slot (#272)

## [1.4.1] - 2026-07-04

### Bug Fixes

- fix(site-navbar): neutral ink for active language option instead of brand accent (#271)

## [1.4.0] - 2026-06-27

### Features

- feat(site-chrome): runtime locale (LOCALE_ID) + factory provider + export locale helpers (#253)

## [1.3.0] - 2026-06-27

### Features

- feat(site-chrome): shared marketing Navbar/Footer/Shell (#251)
- feat(foundation): add bell icon for notifications (#247)
- feat(showcase): brand + dark-mode selectors in Storybook toolbar (#246)

## [1.1.0] - 2026-06-21

### Features

- feat(docs): replace version chip row with a select dropdown (#242)
- feat: containerize storybook showcase for internal hosting (#236)

### Bug Fixes

- fix: build workspace deps before storybook (dist exports) (#239)
- fix: full pnpm install for storybook image (phantom font deps) (#238)
- fix: copy tsconfig.base.json into storybook image build (#237)

## [1.0.1] - 2026-06-20

### Bug Fixes

- fix(brand-dropdown): remove FerrLens from app switcher (#235)

## [1.0.0] - 2026-06-18

### Breaking Changes

- refactor(foundation)!: drop legacy Inter/JetBrains tailwind token files (#202)
- refactor(ui)!: rename @ferrlabs/ui package to @ferrlabs/ui-react (#190)
- feat(ui)!: drop org initial badge from OrgDropdown trigger in expanded mode (#148)
- fix(react)!: default Button primary background to var(--color-accent), not slate ink (#87)
- refactor(primitives)!: rename AppFooter → Footer (App prefix dropped, deprecated alias kept) (#76)
- refactor!: realign primitives + showcase to editorial @ferrlabs/ui-react design system (#74)

### Features

- feat(docs): add @ferrlabs/ui-ng/docs versioned-docs layout (#227)
- feat(ui-ng): add entity-switcher and page chrome (ProjectSwitcher, SiteCard, PageHeader) (#220)
- feat(ui-ng): add app-chrome tier (Shell, Sidebar, Avatar, LogoMark, Menu, UserMenu, BrandDropdown) (#218)
- feat(ui-ng): add overlay tier (Modal, Drawer, Toast) on @angular/cdk (#215)
- feat(ui-ng): port core and form primitives to Angular (#213)
- feat(ui-ng): scaffold the Angular 22 design-system library with Button (#192)
- feat(react): NavItem onClick/danger/disabled + AsyncOrgSelect (#178)
- feat(react): add EntitySwitcher, OrgChip, renderTrigger + collapsed on ProjectSwitcher (#175)
- feat(primitives): add InputGroup to glue form controls into one bordered unit (#174)
- feat(foundation): two-tone the FerrLens logo (loupe in accent teal, grid in slate) (#164)
- feat(astro/PreFooterCTA): reshape bold variant to dark slate card (#163)
- feat(astro/PreFooterCTA): variant='bold' + teal accent (#161)
- feat(astro/navbar): add 'trailing' slot to editorial mode for user menus (#159)
- feat(ui): rebuild Icon against foundation@4 + accept title prop, re-export icons map (#157)
- feat(astro): add Icon.astro that renders any foundation IconName (#156)
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

- fix(ui-ng): build library in partial compilation mode (#231)
- fix(ui-ng): auto-size projected icon SVGs in sidebar/menu/switcher/site-card slots (#224)
- fix(ci): publish ng-packagr libs (ui-ng) from dist/ (#222)
- fix(foundation): define --color-accent and --color-fg token contract (#201)
- fix(tabs): add arrow-key roving focus per WAI-ARIA tabs pattern (#203)
- fix(errorboundary): theme fallback from design tokens with configurable home href (#206)
- fix(ci): set @parcel/watcher allowBuilds to false so pnpm stops failing on ignored build scripts (#193)
- fix(ui): add .js extensions to relative imports for Node ESM resolution (#158)
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

### Refactoring

- refactor(ui): drop tag/description from BrandDropdown app rows, keep app name only (#113)
- refactor(react): Shell composes Sidebar/SidebarSection/SidebarItem from ui-primitives (#94)
- refactor(showcase): reorganize stories into 8 functional categories (#86)
- refactor(primitives): wave 6 specialized form editorial style (#84)
- refactor(primitives): wave 8 disclosure editorial style (#83)
- refactor(primitives): wave 5 form basics editorial style (#82)
- refactor(primitives): wave 7 data editorial style (#81)
- refactor(primitives): wave 4 display editorial style (Card, Skeleton, Spinner, EmptyState, Tabs, Banner) (#80)
- refactor(primitives): wave 3 overlays editorial style (Modal, Drawer, Toast, Tooltip, Popover) (#79)
- refactor(primitives): Navbar + Sidebar editorial style matching real ferrlabs.com / Shell (#77)
- refactor(primitives): AppFooter editorial style (paper/ink, Fraunces, mono uppercase cols) matching real ferrlabs.com footer (#75)
