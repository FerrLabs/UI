import type { CSSProperties } from 'react';
import { icons, type IconName } from '@ferrlabs/ui-icons';

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 16, className, style }: IconProps) {
  const svg = icons[name];
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        display: 'inline-grid',
        placeItems: 'center',
        flexShrink: 0,
        lineHeight: 0,
        color: 'currentColor',
        ...style,
      }}
      dangerouslySetInnerHTML={{
        __html: svg.replace(
          /<svg /,
          `<svg width="${size}" height="${size}" style="display:block" `,
        ),
      }}
    />
  );
}

export type { IconName };
