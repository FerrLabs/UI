# Changelog

All notable changes to `react` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [0.4.0] - 2026-05-02

### Features

- feat(react): add AuthLayout + AuthField + AuthSubmit + AuthDivider (#41)

## [0.3.0] - 2026-05-02

### Features

- feat(react): add product-app chrome (AppShell + AppLogoMark + PageHeader + Stat + Tag + Avatar + AppButton + CommandHint) (#40)
- feat(astro): generic Navbar + Footer with full prop API for cross-product reuse (#35)
- feat(styles): add Firefox scrollbar-width support + thumb hover (#32)
- feat(styles): editorial design system primitives — paper palette, container, btn, eyebrow, dark theme (#25)
- feat(ui-astro): Navbar docs integration (activePage + hideLanguageToggle + slots) — 0.6.0 (#24)
- feat(ui-astro): Navbar + Footer + PreFooterCTA + sticky-bottom layout (#23)
- feat: add @ferrlabs/styles package — Fraunces + DM Mono + Tailwind + brand tokens (#22)
- feat(ui-astro): ship rich LanguageSelect with globe icon, caret, and soft-fallback FR option (#14)

### Bug Fixes

- fix(astro): legacy Navbar border now scroll-aware (was permanent) (#39)
- fix(astro): prevent mixed-content warning on PreFooterCTA mailto form (hijack submit, build mailto in JS) (#38)
- fix(astro): use is:global on Navbar styles (runtime .scrolled was tree-shaken) (#37)
- fix(ci): typecheck and build only changed packages (#30)
- fix(ci): publish only the bumped package on release tag (#29)

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
