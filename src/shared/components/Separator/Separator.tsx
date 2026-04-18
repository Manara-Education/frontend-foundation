import type { HTMLAttributes } from 'react';
import './Separator.css';

type SeparatorOrientation = 'horizontal' | 'vertical';

/**
 * Visual divider line, horizontal or vertical.
 *
 * @param orientation - Direction of the separator line
 *
 * @example
 * <Separator />
 * <Separator orientation="vertical" />
 */
export function Separator({
  orientation = 'horizontal',
  className = '',
  ...props
}: {
  orientation?: SeparatorOrientation;
  className?: string;
} & Omit<HTMLAttributes<HTMLHRElement>, 'className'>) {
  return (
    <hr
      className={['separator', `separator--${orientation}`, className]
        .filter(Boolean)
        .join(' ')}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
}
