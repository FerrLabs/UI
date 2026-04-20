# UI

Shared UI components for [FerrLabs](https://ferrlabs.com) products.

Provides the building blocks — Navbar, Button, Input, Dialog, Toast, etc. — consumed by:
- [FerrFlow-Cloud](https://github.com/FerrLabs/FerrFlow-Cloud) (ferrflow.com + app)
- [FerrVault-Cloud](https://github.com/FerrLabs/FerrVault-Cloud) (ferrvault.com + app)
- [FerrLabs-Cloud](https://github.com/FerrLabs/FerrLabs-Cloud) (ferrlabs.com)

## Packages

```
packages/
├── react/          React components for web apps (app.*.com)
├── astro/          Astro components for marketing sites
├── tailwind/       Shared Tailwind config, tokens, theme
└── icons/          Icon set (SVG)
```

## Usage

Published to GitHub Packages under `@ferrlabs/ui-*` scope. Consumed by each Cloud repo via pnpm workspace dep or npm install.

## Status

**In development.** Seed from the existing components in FerrFlow-Cloud packages/site.

## License

Proprietary.
