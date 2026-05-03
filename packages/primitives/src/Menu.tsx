import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

export type MenuAlign = 'start' | 'end';

export interface MenuProps {
  trigger: ReactElement;
  children: ReactNode;
  align?: MenuAlign;
  className?: string;
}

export interface MenuItemProps {
  onSelect?: () => void;
  href?: string;
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  shortcut?: ReactNode;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Menu({ trigger, children, align = 'start', className }: MenuProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const triggerEl = cloneElement(trigger, {
    'aria-expanded': open,
    'aria-haspopup': 'menu',
    onClick: (e: React.MouseEvent) => {
      const orig = (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick;
      orig?.(e);
      setOpen((v) => !v);
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <span ref={containerRef} className="relative inline-flex">
      {triggerEl}
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={classes(
            'absolute z-40 mt-1 min-w-44 rounded-md bg-white shadow-lg ring-1 ring-slate-200 p-1',
            align === 'end' ? 'right-0' : 'left-0',
            'top-full',
            className,
          )}
        >
          {children}
        </div>
      )}
    </span>
  );
}

export function MenuItem({
  onSelect,
  href,
  icon,
  children,
  disabled,
  destructive,
  shortcut,
}: MenuItemProps) {
  const baseStyles =
    'flex items-center gap-2 px-2.5 py-1.5 rounded text-sm cursor-pointer transition-colors duration-100 focus-visible:outline-none focus-visible:bg-slate-100';
  const stateStyles = disabled
    ? 'opacity-50 cursor-not-allowed'
    : destructive
      ? 'text-red-700 hover:bg-red-50'
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900';

  const content = (
    <>
      {icon && <span className="size-4 shrink-0 grid place-items-center">{icon}</span>}
      <span className="flex-1 min-w-0">{children}</span>
      {shortcut && <span className="text-xs font-mono text-slate-400">{shortcut}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} role="menuitem" className={classes(baseStyles, stateStyles)}>
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      disabled={disabled}
      className={classes(baseStyles, stateStyles, 'text-left w-full')}
    >
      {content}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-slate-200" />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
      {children}
    </div>
  );
}
