# Changelog

All notable changes to `foundation` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [5.5.0] - 2026-09-29

### Features

- feat(foundation): add a list icon (#611)

## [5.4.0] - 2026-08-31

### Features

- feat(docs): collapse the docs sidebar sections (#465)
- feat(ui-ng): add the account slot, inset the surface and mark the current app (#453)
- feat(ui-ng): add flr-app-rail and a shell rail slot (#437)

### Bug Fixes

- fix(ui-ng): colour chart labels and avatar initials instead of dimming them (#478)
- fix(foundation): darken ink-3 so captions clear AA on app surfaces (#474)
- fix(deps): hold the Jest family at 30.4 so the Storybook runner works (#476)
- fix(ci): build ui-ng before the showcase in the accessibility job (#467)
- fix(ui-ng): keep dark product marks visible on the app rail (#449)
- fix(ui-ng): expose the package root in the source exports map (#447)
- fix(ui-ng): let the project switcher fill the sidebar brand row (#442)
- fix(ui-ng): give the app rail solid tiles and accent logos (#444)
- fix(docs): keep the current path on On this page anchors (#417)

## [5.3.1] - 2026-08-19

### Refactoring

- refactor(ui): drop @ferrlabs/ui-astro now that every site is Angular (#407)

## [5.3.0] - 2026-08-18

### Features

- feat(ui-ng): absorb the editorial primitives the app forks duplicate (#405)
- feat(ui): define semantic status tokens and fix status contrast in dark mode (#404)
- feat(ui-ng): give every design token a fallback so components render without the stylesheet (#402)
- feat(ui-ng): let a site declare the locales it actually ships (#401)
- feat(ui-ng): give the bar chart a hover tooltip and a left scale (#391)
- feat(ci): ajoute l'analyse SonarQube (#362)
- feat(ui-ng): let the brand switcher carry internal tools, starting with Storybook (#371)
- feat(ui-ng): add a Pagination component (#365)
- feat(showcase): rebuild the Storybook on @storybook/angular (#369)
- feat(ui-ng): add flr-status-bars for uptime timelines (#348)
- feat(ui-ng): distinguish a loading multi-select from an empty one (#339)
- feat(ui-ng): resolve cross-product links at runtime (#327)
- feat(ui-ng): composant bar-chart sans dependance (#334)
- feat(ui-ng): composant tree-select groupe et pliable (#332)
- feat(ui-ng): composant multi-select filtrable (#330)

### Bug Fixes

- fix(ui-ng): ship the CDK overlay container styles with the components that need them (#385)
- fix(ui-ng): open switcher tools in a new tab instead of replacing the current app (#384)
- fix(ui-ng): dismiss the app switch overlay on bfcache restore and lift it to the top layer (#382)
- fix(ui-ng): relaie l'attribut form du bouton et espace les actions de modale (#346)
- fix(ui-ng): drop the active sidebar item's left bar (#328)
- fix(ci): repair renovate-rebase.yml truncated by the pin sweep (#316)
- fix(ci): install pnpm 11 in the showcase Dockerfile to satisfy engines.pnpm (#304)

### Refactoring

- refactor(ui): drop @ferrlabs/ui-react and the React showcase (#368)

## [5.2.0] - 2026-07-16

### Features

- feat(foundation): explicit cursor affordance in @layer base for buttons, inputs, ARIA roles (#286)
- feat(ci): dispatch Renovate when the rebase box is ticked (#295)
- feat(ui-ng): own the comparison section header (eyebrow, heading, lead) (#294)
- feat(ui-ng): make ComparisonTable cell aria-labels translatable (#292)
- feat(ui-ng): add ComparisonTable for Why-<product> feature comparisons (#288)
- feat(ui-ng): shell breadcrumb-lead slot + site-switcher showTriggerMeta toggle (#275)
- feat(ui-ng): navbar site switcher component + breadcrumb-level shell slot (#272)
- feat(site-chrome): runtime locale (LOCALE_ID) + factory provider + export locale helpers (#253)
- feat(site-chrome): shared marketing Navbar/Footer/Shell (#251)

### Bug Fixes

- fix(ui-ng): align the comparison header with the site page-title scale (#297)
- fix(ui-ng): render ComparisonTable in the mono font token (#293)
- fix(site-navbar): neutral ink for active language option instead of brand accent (#271)

## [5.1.0] - 2026-06-25

### Features

- feat(foundation): add bell icon for notifications (#247)
- feat(showcase): brand + dark-mode selectors in Storybook toolbar (#246)
- feat(docs): replace version chip row with a select dropdown (#242)
- feat: containerize storybook showcase for internal hosting (#236)
- feat(docs): add @ferrlabs/ui-ng/docs versioned-docs layout (#227)
- feat(ui-ng): add entity-switcher and page chrome (ProjectSwitcher, SiteCard, PageHeader) (#220)
- feat(ui-ng): add app-chrome tier (Shell, Sidebar, Avatar, LogoMark, Menu, UserMenu, BrandDropdown) (#218)
- feat(ui-ng): add overlay tier (Modal, Drawer, Toast) on @angular/cdk (#215)
- feat(ui-ng): port core and form primitives to Angular (#213)

### Bug Fixes

- fix: build workspace deps before storybook (dist exports) (#239)
- fix: full pnpm install for storybook image (phantom font deps) (#238)
- fix: copy tsconfig.base.json into storybook image build (#237)
- fix(brand-dropdown): remove FerrLens from app switcher (#235)
- fix(ui-ng): build library in partial compilation mode (#231)
- fix(ui-ng): auto-size projected icon SVGs in sidebar/menu/switcher/site-card slots (#224)
- fix(ci): publish ng-packagr libs (ui-ng) from dist/ (#222)

## [5.0.0] - 2026-06-13

### Breaking Changes

- refactor(ui)!: rename @ferrlabs/ui package to @ferrlabs/ui-react (#190)

### Features

- feat(ui-ng): scaffold the Angular 22 design-system library with Button (#192)
- feat(react): NavItem onClick/danger/disabled + AsyncOrgSelect (#178)
- feat(react): add EntitySwitcher, OrgChip, renderTrigger + collapsed on ProjectSwitcher (#175)
- feat(primitives): add InputGroup to glue form controls into one bordered unit (#174)

### Bug Fixes

- fix(foundation): define --color-accent and --color-fg token contract (#201)
- fix(tabs): add arrow-key roving focus per WAI-ARIA tabs pattern (#203)
- fix(errorboundary): theme fallback from design tokens with configurable home href (#206)
- fix(ci): set @parcel/watcher allowBuilds to false so pnpm stops failing on ignored build scripts (#193)

## [4.3.0] - 2026-05-19

### Features

- feat(foundation): two-tone the FerrLens logo (loupe in accent teal, grid in slate) (#164)
- feat(astro/PreFooterCTA): reshape bold variant to dark slate card (#163)
- feat(astro/PreFooterCTA): variant='bold' + teal accent (#161)
- feat(astro/navbar): add 'trailing' slot to editorial mode for user menus (#159)
- feat(ui): rebuild Icon against foundation@4 + accept title prop, re-export icons map (#157)
- feat(astro): add Icon.astro that renders any foundation IconName (#156)

### Bug Fixes

- fix(ui): add .js extensions to relative imports for Node ESM resolution (#158)

## [4.2.0] - 2026-05-17

### Features

- feat(astro,foundation): register ferrlens as a product (teal accent, between vault and flow) (#155)

## [4.1.0] - 2026-05-17

### Features

- feat(foundation): add zap, sparkles, bookmark, mail, dns, circleSlash, arrowRight icons (#154)

## [4.0.0] - 2026-05-17

### Breaking Changes

- feat(ui)!: drop org initial badge from OrgDropdown trigger in expanded mode (#148)

### Features

- feat(foundation): expose ferrlens loupe mark as both icon registry entry + standalone svg (#153)
- feat(brand): add FerrLens (teal #14b8a6) to BrandDropdown + LogoMark (#151)
- feat(ui): rename SiteSwitcher to ProjectSwitcher and add OrgSwitcher (#147)
- feat(ui): add SiteSwitcher popover and replace unicode chevron with svg in SiteCard (#146)
- feat(ui): add SiteCard and SiteFavicon for site-first sidebars (#145)
- feat(ui): Shell actions[] + projectSlot for sidebar OrgDropdown (#138)

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

## [3.1.0] - 2026-05-07

### Features

- feat(icons): add sidebar icons for product apps (#133)
- feat(ci): trigger ad-hoc Renovate scan after publish (#126)
- feat(ui): Shell topbar — onSearch button (⌘K) + global cmd+K shortcut + userMenu slot (#115)
- feat(ui): add 'admin' to BrandDropdown, ADMIN_APP export + section grouping (#114)
- feat!(ui): merge primitives + react + auth source into ui package, drop sub-packages (UI#105) (#111)

### Bug Fixes

- fix(ui): document subpath exports + collision rationale on the top-level index (#117)
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
