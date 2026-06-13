import {
  createContext,
  useContext,
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  baseId: string;
  variant: 'underline' | 'pill';
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  variant?: 'underline' | 'pill';
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, variant = 'underline', children, className }: TabsProps) {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, onChange, baseId, variant }}>
      <div className={className} style={{ display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
}

export function TabList({ ariaLabel, className, style, children, ...rest }: TabListProps) {
  const ctx = useContext(TabsContext);
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        borderBottom:
          ctx?.variant === 'underline'
            ? '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))'
            : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export function Tab({ value, children, disabled }: TabProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('<Tab> must be used inside <Tabs>.');
  const selected = ctx.value === value;
  const id = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const list = event.currentTarget.closest('[role="tablist"]');
    if (!list) return;
    const tabs = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    const current = tabs.indexOf(event.currentTarget);
    if (current === -1) return;
    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    const target = tabs[next];
    if (!target || target === event.currentTarget) return;
    event.preventDefault();
    target.focus();
    const nextValue = target.dataset.tabValue;
    if (nextValue !== undefined) ctx.onChange(nextValue);
  };

  const baseStyle: CSSProperties = {
    fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    background: 'transparent',
    transition: 'color 160ms ease, border-color 160ms ease, background 160ms ease',
  };

  const variantStyle: CSSProperties =
    ctx.variant === 'underline'
      ? {
          padding: '10px 12px',
          marginBottom: -1,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: selected
            ? '2px solid var(--color-accent, #e8733a)'
            : '2px solid transparent',
          color: selected ? 'var(--color-ink, #1e293b)' : 'var(--color-ink-3, #64748b)',
        }
      : {
          padding: '6px 12px',
          borderRadius: 999,
          border: 'none',
          background: selected ? 'var(--color-accent, #e8733a)' : 'transparent',
          color: selected ? '#fff' : 'var(--color-ink-2, #475569)',
        };

  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-tab-value={value}
      onClick={() => ctx.onChange(value)}
      onKeyDown={onKeyDown}
      className="mono"
      style={{ ...baseStyle, ...variantStyle }}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabPanel({ value, className, style, children, ...rest }: TabPanelProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('<TabPanel> must be used inside <Tabs>.');
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      className={className}
      style={{ paddingTop: 16, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
