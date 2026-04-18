import type { HTMLAttributes, ReactNode } from 'react';
import './Alert.css';

type AlertVariant = 'default' | 'destructive';
type DivProps = { className?: string; children?: ReactNode } & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

/**
 * Feedback banner for informational or error messages.
 *
 * @param variant - Visual style: default or destructive
 *
 * @example
 * <Alert variant="destructive">
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>Something went wrong.</AlertDescription>
 * </Alert>
 */
export function Alert({
  variant = 'default',
  className = '',
  ...props
}: { variant?: AlertVariant } & DivProps) {
  const classes = ['alert', `alert--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return <div role="alert" className={classes} {...props} />;
}

export function AlertTitle({ className = '', ...props }: DivProps) {
  return <h5 className={['alert__title', className].filter(Boolean).join(' ')} {...props} />;
}

export function AlertDescription({ className = '', ...props }: DivProps) {
  return <div className={['alert__description', className].filter(Boolean).join(' ')} {...props} />;
}
