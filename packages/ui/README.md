# @ferrlabs/ui-react

The React UI package for FerrLabs product apps. Exposes the generic
primitives and the composed app chrome through subpath exports, so apps
install one package instead of several. Consolidated from the former
`@ferrlabs/ui-primitives`, `@ferrlabs/ui-react`, and `@ferrlabs/ui-auth`
packages under UI#105.

## Subpaths

| Import path                     | What                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `@ferrlabs/ui-react/primitives` | Generic primitives — Field, Input, Modal, Drawer, Tooltip, Card, Sidebar, Tabs, …              |
| `@ferrlabs/ui-react/react`      | Composed React components — Shell, BrandDropdown, OrgDropdown, Avatar, UserMenu, PageHeader, … |
| `@ferrlabs/ui-react/auth`       | Auth forms — LoginForm and friends                                                             |

## Why subpaths and not a single flat export

`Spinner` and `Footer` exist in both `primitives` and `react` (different
implementations). A flat re-export would shadow one with the other and
create silent bugs. Subpaths keep each layer addressable without
collision.

## Usage

```tsx
import { Field, Input } from '@ferrlabs/ui-react/primitives';
import { Shell, type NavGroup } from '@ferrlabs/ui-react/react';
```

Tokens, fonts, and icons come from `@ferrlabs/ui-foundation`, so a
consuming app depends on two packages:

```json
{
  "dependencies": {
    "@ferrlabs/ui-react": "workspace:*",
    "@ferrlabs/ui-foundation": "workspace:*"
  }
}
```
