import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

export interface ComboboxOption<T = string> {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
  searchText?: string;
  disabled?: boolean;
}

export interface ComboboxProps<T = string> {
  options: Array<ComboboxOption<T>>;
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
  emptyMessage?: ReactNode;
}

export function Combobox<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  disabled = false,
  invalid = false,
  className,
  style,
  emptyMessage = 'No results.',
}: ComboboxProps<T>) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => {
      const text = (o.searchText ?? (typeof o.label === 'string' ? o.label : '')).toLowerCase();
      return text.includes(q);
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, [open]);

  function commit(opt: ComboboxOption<T>) {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) commit(opt);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const errorColor = '#dc2626';
  const accent = 'var(--color-accent, var(--color-fg, #1e293b))';
  const ringShadow = invalid
    ? `0 0 0 4px color-mix(in oklab, ${errorColor} 14%, transparent)`
    : `0 0 0 4px color-mix(in oklab, ${accent} 14%, transparent)`;
  const borderColor = invalid
    ? errorColor
    : focused
      ? accent
      : 'var(--color-rule-strong, rgba(30, 41, 59, 0.24))';

  const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    height: 40,
    padding: '0 32px 0 14px',
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    background: disabled ? 'var(--color-paper-2, #f4f4f2)' : 'var(--color-card, #ffffff)',
    fontFamily: 'var(--font-serif, "Fraunces", Georgia, ui-serif, serif)',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 1.4,
    color: disabled ? 'var(--color-ink-3, #64748b)' : 'var(--color-ink, #1e293b)',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 140ms, box-shadow 140ms',
    boxShadow: focused ? ringShadow : 'none',
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${id}-opt-${activeIndex}` : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        placeholder={placeholder}
        value={
          open
            ? query
            : selectedOption && typeof selectedOption.label === 'string'
              ? selectedOption.label
              : query
        }
        onChange={(e) => {
          setQuery(e.currentTarget.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKey}
        style={inputStyle}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-ink-3, #64748b)',
          pointerEvents: 'none',
          display: 'inline-flex',
        }}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          style={{
            position: 'absolute',
            zIndex: 30,
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: 240,
            overflowY: 'auto',
            margin: 0,
            padding: 4,
            listStyle: 'none',
            background: 'var(--color-card, #ffffff)',
            border: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          }}
        >
          {filtered.length === 0 ? (
            <li
              style={{
                padding: '8px 12px',
                fontSize: 14,
                color: 'var(--color-ink-3, #64748b)',
              }}
            >
              {emptyMessage}
            </li>
          ) : (
            filtered.map((opt, i) => {
              const selected = selectedOption?.value === opt.value;
              const active = i === activeIndex;
              return (
                <li
                  key={String(opt.value)}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={opt.disabled || undefined}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(opt);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'var(--font-serif, "Fraunces", Georgia, ui-serif, serif)',
                    cursor: opt.disabled ? 'not-allowed' : 'pointer',
                    opacity: opt.disabled ? 0.5 : 1,
                    background: active ? 'var(--color-paper-2, #f4f4f2)' : 'transparent',
                    color: selected ? accent : 'var(--color-ink, #1e293b)',
                    transition: 'background 120ms',
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {opt.label}
                  </span>
                  {opt.hint && (
                    <span
                      className="mono"
                      style={{
                        fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                        fontSize: 11,
                        color: 'var(--color-ink-3, #64748b)',
                      }}
                    >
                      {opt.hint}
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
