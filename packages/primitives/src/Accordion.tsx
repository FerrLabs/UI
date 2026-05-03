import { createContext, useContext, useId, useState, type ReactNode } from 'react';

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
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Accordion({ type = 'multiple', defaultOpen, children, className }: AccordionProps) {
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
      <div className={classes('flex flex-col divide-y divide-slate-200', className)}>
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

  return (
    <div>
      <h3>
        <button
          type="button"
          id={headingId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => ctx.toggle(id)}
          className="w-full flex items-center justify-between gap-3 py-3 text-left text-sm font-medium text-slate-900 cursor-pointer hover:text-accent transition-colors"
        >
          <span>{trigger}</span>
          <span
            aria-hidden
            className={classes(
              'shrink-0 transition-transform duration-200 text-slate-400',
              isOpen && 'rotate-180',
            )}
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
          className="pb-4 text-sm text-slate-600 leading-relaxed"
        >
          {children}
        </div>
      )}
    </div>
  );
}
