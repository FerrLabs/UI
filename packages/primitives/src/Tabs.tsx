import { createContext, useContext, useId, type HTMLAttributes, type ReactNode } from 'react';

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

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Tabs({ value, onChange, variant = 'underline', children, className }: TabsProps) {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, onChange, baseId, variant }}>
      <div className={classes('flex flex-col', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
}

export function TabList({ ariaLabel, className, children, ...rest }: TabListProps) {
  const ctx = useContext(TabsContext);
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={classes(
        'flex items-center gap-1',
        ctx?.variant === 'underline' && 'border-b border-slate-200',
        className,
      )}
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

  const baseStyles =
    'cursor-pointer text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles =
    ctx.variant === 'underline'
      ? selected
        ? 'px-3 py-2 border-b-2 -mb-px border-accent text-slate-900'
        : 'px-3 py-2 border-b-2 -mb-px border-transparent text-slate-500 hover:text-slate-900'
      : selected
        ? 'px-3 py-1.5 rounded-full bg-accent text-white'
        : 'px-3 py-1.5 rounded-full text-slate-600 hover:bg-slate-100';

  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => ctx.onChange(value)}
      className={classes(baseStyles, variantStyles)}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabPanel({ value, className, children, ...rest }: TabPanelProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('<TabPanel> must be used inside <Tabs>.');
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      className={classes('pt-4', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
