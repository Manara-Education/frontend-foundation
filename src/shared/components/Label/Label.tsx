import type { LabelHTMLAttributes } from 'react';
import './Label.css';

/**
 * Styled form label with disabled-state support.
 *
 * @param disabled - Dims the label to indicate a disabled field
 *
 * @example
 * <Label htmlFor="email">Email address</Label>
 */
export function Label({
  className = '',
  disabled,
  ...props
}: { className?: string; disabled?: boolean } & Omit<LabelHTMLAttributes<HTMLLabelElement>, 'className'>) {
  const classes = ['label', disabled ? 'label--disabled' : '', className]
    .filter(Boolean)
    .join(' ');

  return <label className={classes} {...props} />;
}
