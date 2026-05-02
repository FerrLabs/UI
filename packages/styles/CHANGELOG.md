# Changelog

All notable changes to `styles` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

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
