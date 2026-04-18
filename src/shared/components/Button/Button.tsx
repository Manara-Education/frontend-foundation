import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

/**
 * Versatile button component with multiple visual variants and sizes.
 *
 * @param variant - Visual style: default, destructive, outline, secondary, ghost, link
 * @param size - Button size: default, sm, lg, icon
 *
 * @example
 * <Button variant="default" onClick={handleClick}>Save</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 * <Button variant="destructive">Delete</Button>
 */
export function Button({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>) {
  const classes = [
    'button',
    `button--${variant}`,
    size !== 'default' ? `button--${size}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
