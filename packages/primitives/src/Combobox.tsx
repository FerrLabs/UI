import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';

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
  emptyMessage?: ReactNode;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Combobox<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  disabled = false,
  invalid = false,
  className,
  emptyMessage = 'No results.',
}: ComboboxProps<T>) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={containerRef} className={classes('relative w-full', className)}>
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
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        className={classes(
          'w-full h-10 px-3 pr-8 rounded-md bg-white text-sm text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:bg-slate-50 disabled:cursor-not-allowed',
          invalid && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
        )}
      />
      <span
        aria-hidden
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
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
          className="absolute z-30 mt-1 left-0 right-0 max-h-60 overflow-y-auto bg-white shadow-lg ring-1 ring-slate-200 rounded-md p-1"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</li>
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
                  className={classes(
                    'flex items-baseline gap-2 px-3 py-1.5 rounded text-sm cursor-pointer',
                    active && 'bg-slate-100',
                    selected && 'text-accent',
                    opt.disabled && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <span className="flex-1 min-w-0 truncate">{opt.label}</span>
                  {opt.hint && <span className="text-xs text-slate-500">{opt.hint}</span>}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
