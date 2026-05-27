import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { SiteCard } from './SiteCard.js';

export interface ProjectSwitcherItem {
  id: string;
  label: string;
  icon: ReactNode;
  meta?: ReactNode;
  href?: string;
  searchTerms?: string;
}

export interface ProjectSwitcherPlaceholder {
  label: string;
  icon: ReactNode;
  meta?: ReactNode;
}

export interface ProjectSwitcherProps {
  current: ProjectSwitcherItem | null;
  items: ProjectSwitcherItem[];
  onSelect: (id: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
  placeholder?: ProjectSwitcherPlaceholder;
  title?: string;
  searchPlaceholder?: string;
  defaultOpen?: boolean;
  shortcut?: { mod?: boolean; key: string } | null;
  emptyState?: ReactNode;
  /**
   * Static eyebrow caption rendered on the trigger card (e.g. `VAULT`, `SITE`,
   * `PROJECT`, `WORKSPACE`). Disambiguates the kind of entity the switcher
   * manages in a multi-product chrome — same shape, different label per
   * product. Omit to keep the trigger un-labelled (legacy behaviour).
   */
  triggerEyebrow?: ReactNode;
  /**
   * Escape hatch to fully replace the trigger card. When provided, the default
   * `SiteCard` is not rendered. Use this when the standard card layout
   * (icon + label + meta + chevron) doesn't fit — e.g. a compact pill, a
   * gradient hero tile, or an icon-only collapsed state.
   *
   * The function receives the resolved `current` / `placeholder` / `eyebrow`
   * plus an `onClick` that toggles the dropdown — wire it on whichever
   * element should open the panel. Also receives `collapsed` so a single
   * trigger can adapt to both states.
   */
  renderTrigger?: (args: {
    current: ProjectSwitcherItem | null;
    placeholder?: ProjectSwitcherPlaceholder;
    eyebrow?: ReactNode;
    onClick: () => void;
    collapsed: boolean;
  }) => ReactNode;
  /**
   * Collapsed sidebar mode — renders just the current item's icon as a 32×32
   * tile instead of the full SiteCard. Click opens the same dropdown (anchored
   * to a 240px panel so it isn't cropped by the narrow sidebar). When
   * `renderTrigger` is also set, the prop is forwarded and the consumer
   * decides how the collapsed trigger looks.
   */
  collapsed?: boolean;
}

const DEFAULT_SHORTCUT = { mod: true, key: 'k' };

function isMod(e: KeyboardEvent | ReactKeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey;
}

export function ProjectSwitcher({
  current,
  items,
  onSelect,
  onCreate,
  createLabel = 'Create new',
  onViewAll,
  viewAllLabel = 'View all',
  placeholder,
  title = 'Switch',
  searchPlaceholder = 'Search…',
  defaultOpen = false,
  shortcut = DEFAULT_SHORTCUT,
  emptyState,
  triggerEyebrow,
  renderTrigger,
  collapsed = false,
}: ProjectSwitcherProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((it) => {
      if (it.label.toLowerCase().includes(q)) return true;
      if (it.searchTerms && it.searchTerms.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [items, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if (shortcut.mod && !isMod(e)) return;
      if (e.key.toLowerCase() !== shortcut.key.toLowerCase()) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/i.test(target.tagName)) {
        if (!rootRef.current?.contains(target)) return;
      }
      e.preventDefault();
      setOpen((o) => !o);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [open]);

  const commitHighlight = () => {
    const item = filtered[highlight];
    if (item) {
      onSelect(item.id);
      setOpen(false);
      setQuery('');
    }
  };

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commitHighlight();
    }
  };

  const trigger = current ?? null;
  const displayedIcon = trigger?.icon ?? placeholder?.icon ?? null;
  const displayedLabel = trigger?.label ?? placeholder?.label ?? 'All items';
  const displayedMeta = trigger?.meta ?? placeholder?.meta ?? null;

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      {renderTrigger ? (
        renderTrigger({
          current: trigger,
          placeholder,
          eyebrow: triggerEyebrow,
          onClick: () => setOpen((o) => !o),
          collapsed,
        })
      ) : collapsed ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={displayedLabel}
          title={displayedLabel}
          style={{
            all: 'unset',
            boxSizing: 'border-box',
            width: 32,
            height: 32,
            borderRadius: 7,
            display: 'grid',
            placeItems: 'center',
            margin: '8px auto',
            background: 'var(--color-card, #fff)',
            border: '1px solid var(--color-rule, rgba(30,41,59,0.14))',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
        >
          {displayedIcon}
        </button>
      ) : (
        <SiteCard
          icon={displayedIcon}
          label={displayedLabel}
          meta={displayedMeta}
          eyebrow={triggerEyebrow}
          onClick={() => setOpen((o) => !o)}
        />
      )}
      {open ? (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: collapsed ? 0 : 12,
            right: collapsed ? undefined : 12,
            width: collapsed ? 260 : undefined,
            background: 'var(--color-card, #fff)',
            border: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
            borderRadius: 10,
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.14)',
            padding: 6,
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: 360,
            animation: 'ferrlabs-project-switcher-in 140ms ease-out',
          }}
        >
          <style>{`
            @keyframes ferrlabs-project-switcher-in {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: none; }
            }
          `}</style>
          <div
            style={{
              fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
              padding: '6px 10px 4px',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-fg-3, #64748b)',
            }}
          >
            {title}
          </div>
          <div style={{ padding: '0 6px 6px' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKey}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: 13,
                border: '1px solid var(--color-rule, #e2e8f0)',
                borderRadius: 6,
                background: 'var(--color-bg-2, #f8fafc)',
                color: 'var(--color-fg, #0f172a)',
                outline: 'none',
              }}
            />
          </div>
          <div
            style={{
              overflowY: 'auto',
              maxHeight: 260,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '12px 10px',
                  fontSize: 12,
                  color: 'var(--color-fg-3, #94a3b8)',
                  textAlign: 'center',
                }}
              >
                {emptyState ?? 'No results'}
              </div>
            ) : (
              filtered.map((it, idx) => {
                const isCurrent = current?.id === it.id;
                const isHl = idx === highlight;
                return (
                  <button
                    key={it.id}
                    type="button"
                    role="menuitem"
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => {
                      onSelect(it.id);
                      setOpen(false);
                      setQuery('');
                    }}
                    aria-current={isCurrent ? 'true' : undefined}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: isHl
                        ? 'var(--color-app-nav-hover, rgba(30, 41, 59, 0.06))'
                        : 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: 'var(--color-fg, #0f172a)',
                      textAlign: 'left',
                      transition: 'background 80ms',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {it.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: isCurrent ? 600 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {it.label}
                      </div>
                      {it.meta ? (
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--color-fg-3, #94a3b8)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {it.meta}
                        </div>
                      ) : null}
                    </div>
                    {isCurrent ? (
                      <span
                        aria-hidden
                        style={{
                          color: 'var(--color-fg-3, #64748b)',
                          fontSize: 11,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
          {onCreate || onViewAll ? (
            <>
              <div
                style={{
                  height: 1,
                  background: 'var(--color-rule, rgba(30, 41, 59, 0.10))',
                  margin: '4px -6px',
                }}
              />
              {onViewAll ? (
                <button
                  type="button"
                  onClick={() => {
                    onViewAll();
                    setOpen(false);
                  }}
                  style={footerBtnStyle}
                >
                  <span aria-hidden style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                    →
                  </span>
                  <span style={{ flex: 1 }}>{viewAllLabel}</span>
                </button>
              ) : null}
              {onCreate ? (
                <button
                  type="button"
                  onClick={() => {
                    onCreate();
                    setOpen(false);
                  }}
                  style={footerBtnStyle}
                >
                  <span aria-hidden>+</span>
                  <span style={{ flex: 1 }}>{createLabel}</span>
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const footerBtnStyle = {
  width: '100%',
  padding: '8px 10px',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  color: 'var(--color-fg-2, #475569)',
  textAlign: 'left' as const,
  fontSize: 13,
  transition: 'background 80ms',
};
