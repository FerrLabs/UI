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

## Splitter

Resizable panes with a draggable, keyboard accessible handle between each pair.

```ts
import { SplitterComponent, SplitterPaneComponent } from '@ferrlabs/ui-ng';

@Component({
  imports: [SplitterComponent, SplitterPaneComponent],
  template: `
    <flr-splitter storageKey="editor" [stackBelow]="640" (resizeEnd)="onResize($event)">
      <flr-splitter-pane label="Sidebar" defaultSize="30%" minSize="160" maxSize="50%" collapsible>
        ...
      </flr-splitter-pane>
      <flr-splitter-pane label="Content" minSize="240">...</flr-splitter-pane>
    </flr-splitter>
  `,
})
export class Demo {}
```

`flr-splitter` inputs: `orientation` (`'horizontal'` panes side by side, the default, or `'vertical'`
panes stacked), `stacked` (force the stacked layout), `stackBelow` (width in px under which a
horizontal splitter stacks and drops its handles), `storageKey` (persist sizes and collapsed state in
`localStorage` under `flr-splitter:<key>`), `keyboardStep` (px per arrow press, Shift is 5x, default
10). Output: `resizeEnd` with `{ sizes, ratios, collapsed }`, emitted when a drag ends and after each
keyboard resize, collapse or reset.

`flr-splitter-pane` inputs: `defaultSize`, `minSize`, `maxSize` (px number or `'30%'`), `collapsible`,
`label` (used in the handle label and the announcements), and `[(collapsed)]`. Panes without a
`defaultSize` share the remaining space.

The splitter fills its parent (`width` and `height` 100%), so give the parent a definite size, in
particular for `orientation="vertical"`. Sizes are kept as ratios of the container, so they follow
window resizes; min and max still apply. A px `defaultSize` stays in px until the first resize.

Interaction: drag with mouse, touch or pen; arrow keys resize (Shift for bigger steps), Home and End
jump to min and max, Enter collapses or expands a collapsible neighbour, double-click resets sizes
and expands collapsed panes. The handle is a focusable `role="separator"` with `aria-valuenow`,
`aria-valuemin`, `aria-valuemax` (percent of the container) and `aria-controls` pointing at the pane
before it, with a 24px hit area. `aria-orientation` is the separator's own: a horizontal splitter has
vertical separators. The new size is announced through the CDK `LiveAnnouncer` (polite). Right-to-left
direction is read from CSS `direction`.

## Versioned docs (`@ferrlabs/ui-ng/docs`)

Brand-agnostic versioned-documentation layout, shared across product sites.
`DocsLayoutComponent` renders the docs grid only (sidebar + version switcher,
scrollable main with prev/next pager, on-this-page TOC) and projects rendered
markdown into a `.ferr-prose` article via `<ng-content>`. It is shell-free — wrap
it in your own product shell. The nav, versions, language, and URL segment are
inputs, so the content stays in the consumer; only the structure ships here.

```ts
import { DocsLayoutComponent, DocSection, DocVersion } from '@ferrlabs/ui-ng/docs';

const NAV: readonly DocSection[] = [
  { label: 'Getting started', items: [{ label: 'Introduction', slug: 'introduction' }] },
];
const VERSIONS: readonly DocVersion[] = [{ slug: 'current', label: 'v5' }];

@Component({
  imports: [DocsLayoutComponent],
  template: `
    <flr-docs-layout [nav]="nav" [versions]="versions" slug="introduction" lang="en">
      <!-- rendered markdown -->
    </flr-docs-layout>
  `,
})
export class DocsPage {
  protected readonly nav = NAV;
  protected readonly versions = VERSIONS;
}
```

Import the markdown-content stylesheet once (it styles `.ferr-prose`,
`.ferr-aside`, `.ferr-card`, `.ferr-tabs` — all CSS-var driven):

```css
@import '@ferrlabs/ui-ng/docs/styles.css';
```

## Markdown and code (`@ferrlabs/ui-ng/markdown`)

Syntax-highlighted code and sanitized GFM rendering, in a secondary entry point so
the main entry stays free of these dependencies. Install the optional peers only if
you import it:

```sh
pnpm add marked marked-highlight prismjs
```

```ts
import {
  CodeComponent,
  MarkdownComponent,
  MarkdownEditorComponent,
} from '@ferrlabs/ui-ng/markdown';
```

```html
<flr-code [code]="snippet" language="rust" /> <flr-markdown [source]="report" />
```

- `flr-code`: inputs `code` (required) and `language`. Unknown or missing languages
  render as escaped plain text. The header shows the language and a copy button.
- `flr-markdown`: input `source`. Renders GFM (tables, task lists, strikethrough),
  highlights fenced code, and passes the result through Angular's `[innerHTML]`
  sanitizer, so scripts and event handlers in the source are stripped. Links get
  `rel="noopener noreferrer"`.
- `flr-markdown-editor`: `ControlValueAccessor` (`ngModel` / reactive forms) with a
  markdown string value. Inputs `placeholder`, `rows` (default 8), `minHeight`, `labels` (partial
  `MarkdownEditorLabels` merged over the English defaults: toolbar buttons with their
  shortcut hints, tab names, `editorMode`, `formatting`, `nothingToPreview`) and
  `aria-label`; disabled comes from the form control. Write / Preview tabs, a
  formatting toolbar (bold, italic, strikethrough, heading cycling H1 to H3, inline
  code, code block, link, bullet, numbered and task lists, quote) and Ctrl/Cmd+B,
  I, K shortcuts. Preview renders through `flr-markdown`.
- Languages: javascript, typescript, json, bash, rust, python, yaml, toml, sql,
  diff, markdown, css, markup (html/xml), go, docker. Common aliases (`ts`, `sh`,
  `yml`, `rs`, `html`, ...) resolve.
- Theming: `--color-code-*` tokens from `@ferrlabs/ui-foundation` (bg, fg, comment,
  keyword, string, number, function, operator, punctuation, property, inserted,
  deleted), with light and dark values. No stylesheet import is needed; styles ship
  with the components (`ViewEncapsulation.None`, scoped by the `.flr-code` and
  `.flr-markdown` host classes so the rendered HTML can be styled).

## Conventions

- **Standalone** components, no NgModules.
- **Signal inputs** (`input()`) and **signal outputs** (`output()`).
- `ChangeDetectionStrategy.OnPush` everywhere (the app runs **zoneless**).
- Selectors are prefixed `flr-`.
- Build: `pnpm --filter @ferrlabs/ui-ng build` (ng-packagr → Angular Package Format).

## License

Licensed under either of [Apache-2.0](LICENSE-APACHE) or [MIT](LICENSE-MIT), at your option.
