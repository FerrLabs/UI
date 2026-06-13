# @ferrlabs/ui-foundation

Framework-agnostic FerrLabs design foundation. Bundles together what was
previously three separate packages (`@ferrlabs/ui-icons`,
`@ferrlabs/styles`, `@ferrlabs/ui-tailwind`) so consumers install one
package instead of three. Tracked under UI#105.

## What's in here

| Subpath                                     | What                                                       | Used by                  |
| ------------------------------------------- | ---------------------------------------------------------- | ------------------------ |
| `@ferrlabs/ui-foundation/icons`             | SVG icon set as raw strings (Lucide-inspired stroke icons) | React + Astro            |
| `@ferrlabs/ui-foundation/styles/global.css` | Base stylesheet — fonts + Tailwind import + brand tokens   | Every app's `global.css` |
| `@ferrlabs/ui-foundation/styles/tokens.css` | Brand color + typography tokens (consumed via `@theme`)    | apps/sites               |

## Usage

### React app

```ts
import { icons, type IconName } from '@ferrlabs/ui-foundation/icons';
```

```css
/* app/src/index.css */
@import '@ferrlabs/ui-foundation/styles/global.css';
```

### Astro site

```astro
---
import { icons } from '@ferrlabs/ui-foundation/icons';
---
<div set:html={icons.shield} />
```

```css
/* site/src/styles/global.css */
@import '@ferrlabs/ui-foundation/styles/global.css';
```

## Migration from old packages

The old packages (`@ferrlabs/ui-icons`, `@ferrlabs/styles`,
`@ferrlabs/ui-tailwind`) keep working as re-export shells during the
transition window — change imports at your own pace. New consumers
should target `@ferrlabs/ui-foundation` directly.
