# @ferrlabs/ui

Single React UI package for FerrLabs product apps. Re-exports everything
from the underlying `@ferrlabs/ui-primitives`, `@ferrlabs/ui-react`, and
`@ferrlabs/ui-auth` packages via subpath exports — apps install one
package instead of three. Tracked under UI#105.

## Subpaths

| Import path | What |
|---|---|
| `@ferrlabs/ui/primitives` | Generic primitives — Field, Input, Modal, Drawer, Tooltip, Card, Sidebar, Tabs, … |
| `@ferrlabs/ui/react` | Composed React components — Shell, BrandDropdown, OrgDropdown, Avatar, UserMenu, PageHeader, … |

`@ferrlabs/ui/auth` will be added when `@ferrlabs/ui-auth` (currently a
WIP scaffold without a build) ships its first stable release.

## Why subpaths and not a single flat export

`Spinner` and `Footer` exist in both `primitives` and `react` (different
implementations). A flat re-export would shadow one with the other and
create silent bugs. Subpaths keep each layer addressable without
collision.

## Usage

```tsx
import { Field, Input } from '@ferrlabs/ui/primitives';
import { Shell, type NavGroup } from '@ferrlabs/ui/react';
```

`package.json` deps section drops from this:

```json
{
  "dependencies": {
    "@ferrlabs/ui-primitives": "^1.0.0",
    "@ferrlabs/ui-react": "^1.0.0",
    "@ferrlabs/ui-auth": "^1.0.0",
    "@ferrlabs/ui-icons": "^1.0.0",
    "@ferrlabs/styles": "^0.4.0",
    "@ferrlabs/ui-tailwind": "^0.2.0"
  }
}
```

To this (combined with `@ferrlabs/ui-foundation`):

```json
{
  "dependencies": {
    "@ferrlabs/ui": "^1.0.0",
    "@ferrlabs/ui-foundation": "^1.0.0"
  }
}
```

## Migration from old packages

The three underlying packages stay alive — `@ferrlabs/ui-primitives`,
`@ferrlabs/ui-react`, `@ferrlabs/ui-auth` keep working unchanged.
`@ferrlabs/ui` is purely additive. Migrate consumers at your own pace by
swapping import paths.

Old → new:
```
@ferrlabs/ui-primitives  →  @ferrlabs/ui/primitives
@ferrlabs/ui-react       →  @ferrlabs/ui/react
```
