import type { HTMLAttributes } from 'react';
import './Spinner.css';

type SpinnerSize = 'default' | 'sm' | 'lg';

/**
 * CSS-only rotating loading indicator.
 *
 * @param size - Spinner diameter: sm, default, lg
 *
 * @example
 * <Spinner />
 * <Spinner size="lg" />
 */
export function Spinner({
  size = 'default',
  className = '',
  ...props
}: {
  size?: SpinnerSize;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>) {
  const classes = [
    'spinner',
    size !== 'default' ? `spinner--${size}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}
