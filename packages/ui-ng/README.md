# @ferrlabs/ui-ng

FerrLabs design system — **Angular 22** components (standalone, signals, zoneless).

Sibling of `@ferrlabs/ui-react`: same design language, same tokens. Visual
parity comes from the shared, framework-agnostic
[`@ferrlabs/ui-foundation`](../foundation) (token CSS variables + Tailwind
layers) — `ui-ng` ships no design values of its own, it reads
`--color-accent`, `--color-fg`, `--font-mono`, etc.

> **Status: WIP.** Scaffold + first primitive (`Button`). The rest of the
> ~40 primitives + app chrome are being ported surface-by-surface during the
> React → Angular migration. At the end of the migration this becomes the only
> component library and is renamed to `@ferrlabs/ui`.

## Install

```bash
pnpm add @ferrlabs/ui-ng @ferrlabs/ui-foundation
```

Pull the tokens once (e.g. in your global stylesheet or Tailwind entry):

```css
@import '@ferrlabs/ui-foundation/styles/tokens.css';
```

## Usage

```ts
import { ButtonComponent } from '@ferrlabs/ui-ng';

@Component({
  imports: [ButtonComponent],
  template: `
    <flr-button variant="primary" size="md" (pressed)="save()">Save</flr-button>
    <flr-button variant="ghost" [loading]="saving()">Saving…</flr-button>
    <flr-button variant="danger" href="/delete">Delete</flr-button>
  `,
})
export class Demo {}
```

## Conventions

- **Standalone** components, no NgModules.
- **Signal inputs** (`input()`) and **signal outputs** (`output()`).
- `ChangeDetectionStrategy.OnPush` everywhere (the app runs **zoneless**).
- Selectors are prefixed `flr-`.
- Build: `pnpm --filter @ferrlabs/ui-ng build` (ng-packagr → Angular Package Format).
