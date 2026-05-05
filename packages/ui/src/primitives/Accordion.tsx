import {
  createContext,
  useContext,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

interface AccordionContextValue {
  open: Set<string>;
  toggle: (id: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultOpen?: string[];
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Accordion({
  type = 'multiple',
  defaultOpen,
  children,
  className,
  style,
}: AccordionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen ?? []));

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(type === 'single' ? [] : prev);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <AccordionContext.Provider value={{ open, toggle, type }}>
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...style,
        }}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps {
  id: string;
  trigger: ReactNode;
  children: ReactNode;
}

export function AccordionItem({ id, trigger, children }: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('<AccordionItem> must be used inside <Accordion>.');
  const isOpen = ctx.open.has(id);
  const headingId = useId();
  const panelId = useId();
  const [hover, setHover] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))' }}>
      <h3 style={{ margin: 0 }}>
        <button
          type="button"
          id={headingId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => ctx.toggle(id)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 0',
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
            fontWeight: 600,
            color: hover ? 'var(--color-accent, #e8733a)' : 'var(--color-ink, #1e293b)',
            transition: 'color 160ms ease',
          }}
        >
          <span>{trigger}</span>
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              color: 'var(--color-ink-3, #64748b)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms ease',
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
        </button>
      </h3>
      {isOpen && (
        <div
          role="region"
          id={panelId}
          aria-labelledby={headingId}
          style={{
            paddingBottom: 16,
            fontSize: 14,
            color: 'var(--color-ink-2, #475569)',
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
