interface Props {
  /** What gets shown inside the kbd — defaults to `⌘K`. */
  shortcut?: string;
  /** Label before the kbd — defaults to `Search`. */
  label?: string;
}

/** Search-trigger affordance for the topbar (keyboard hint chip). */
export function CommandHint({ shortcut = '⌘K', label = 'Search' }: Props = {}) {
  return (
    <div
      className="mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 8,
        border: '1px solid var(--color-rule)',
        background: 'var(--color-card)',
        fontSize: 11,
        color: 'var(--color-fg-3)',
      }}
    >
      <span>{label}</span>
      <kbd
        style={{
          background: 'var(--color-bg-2)',
          border: '1px solid var(--color-rule)',
          borderRadius: 4,
          padding: '1px 6px',
          fontSize: 10,
        }}
      >
        {shortcut}
      </kbd>
    </div>
  );
}
