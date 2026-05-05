# Changelog

All notable changes to `styles` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - 2026-05-05

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

### Bug Fixes

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

## [0.4.0] - 2026-05-02

### Features

- feat(astro,styles): add 'amber' accent for FerrFleet brand (#45)
- feat(react): add BrandDropdown component for app switching (#42)
- feat(react): add AuthLayout + AuthField + AuthSubmit + AuthDivider (#41)
- feat(react): add product-app chrome (AppShell + AppLogoMark + PageHeader + Stat + Tag + Avatar + AppButton + CommandHint) (#40)
- feat(astro): generic Navbar + Footer with full prop API for cross-product reuse (#35)

### Bug Fixes

- fix(astro): legacy Navbar border now scroll-aware (was permanent) (#39)
- fix(astro): prevent mixed-content warning on PreFooterCTA mailto form (hijack submit, build mailto in JS) (#38)
- fix(astro): use is:global on Navbar styles (runtime .scrolled was tree-shaken) (#37)

## [0.3.0] - 2026-04-29

### Features

- feat(styles): add Firefox scrollbar-width support + thumb hover (#32)

### Bug Fixes

- fix(ci): typecheck and build only changed packages (#30)
- fix(ci): publish only the bumped package on release tag (#29)

## [0.2.0] - 2026-04-28

### Features

- feat(styles): editorial design system primitives — paper palette, container, btn, eyebrow, dark theme (#25)
- feat(ui-astro): Navbar docs integration (activePage + hideLanguageToggle + slots) — 0.6.0 (#24)
- feat(ui-astro): Navbar + Footer + PreFooterCTA + sticky-bottom layout (#23)
