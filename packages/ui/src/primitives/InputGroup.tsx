import { Children, cloneElement, isValidElement, type CSSProperties, type ReactNode } from 'react';

export interface InputGroupProps {
  /** The form controls / labels to glue together. Order = visual order. */
  children: ReactNode;
  /** Size hint passed through to children that accept it (Input, Select). */
  size?: 'sm' | 'md' | 'lg';
  /** Same border-error visual as a single Input would render. */
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Visually glues 2+ form controls or static labels into a single bordered
 * group. The first child keeps its left-rounded corner, the last child
 * keeps its right-rounded corner, and internal borders collapse so the
 * group reads as one unit (think shadcn `InputGroup`, Tailwind UI's
 * "input with leading dropdown", or stripe's combined input).
 *
 * Each child is cloned and given:
 *   - flattened corners on the side touching its sibling
 *   - a negative left margin on every non-first child (so adjacent borders
 *     stack into one line instead of doubling up)
 *
 * Children may be:
 *   - `<Input />` / `<Select />` (the size + style props are honored)
 *   - any other element with a `style` prop (a plain `<span>` static
 *     label, a custom control, …)
 *
 * Usage:
 * ```tsx
 * <InputGroup>
 *   <Select value={scheme} onChange={…}>
 *     <option value="vault">vault://</option>
 *     <option value="aws-kms">aws-kms://</option>
 *   </Select>
 *   <Input value={key} onChange={…} placeholder="my-app-kek" />
 * </InputGroup>
 * ```
 */
export function InputGroup({ children, size, invalid, className, style }: InputGroupProps) {
  const items = Children.toArray(children).filter(Boolean);
  const last = items.length - 1;

  const rootStyle: CSSProperties = {
    display: 'inline-flex',
    width: '100%',
    alignItems: 'stretch',
    ...style,
  };

  return (
    <div className={className} style={rootStyle}>
      {items.map((child, i) => {
        if (!isValidElement(child)) return child;
        const isFirst = i === 0;
        const isLast = i === last;
        const childProps = child.props as {
          style?: CSSProperties;
          size?: 'sm' | 'md' | 'lg';
          invalid?: boolean;
        };

        const segmentStyle: CSSProperties = {
          // Collapse adjacent borders into one line.
          marginLeft: isFirst ? undefined : -1,
          borderTopLeftRadius: isFirst ? undefined : 0,
          borderBottomLeftRadius: isFirst ? undefined : 0,
          borderTopRightRadius: isLast ? undefined : 0,
          borderBottomRightRadius: isLast ? undefined : 0,
          // Hovered/focused children should sit on top so their full
          // border (and the focus ring) isn't clipped by the next
          // segment's overlapping margin.
          position: 'relative',
          flex: i === last ? '1 1 auto' : '0 0 auto',
          ...childProps.style,
        };

        return cloneElement(child, {
          // Only pass size/invalid down if the child doesn't already
          // declare them — explicit child props win over the group's.
          size: childProps.size ?? size,
          invalid: childProps.invalid ?? invalid,
          style: segmentStyle,
        } as Partial<typeof childProps>);
      })}
    </div>
  );
}
