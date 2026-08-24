import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

/**
 * Small status label for tagging and categorization.
 *
 * @param variant - Visual style: default, secondary, destructive, outline
 *
 * @example
 * <Badge variant="default">New</Badge>
 * <Badge variant="destructive">Overdue</Badge>
 */
export function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: {
  variant?: BadgeVariant;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'className'>) {
  const classes = ['badge', `badge--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
