import type { InputHTMLAttributes } from 'react';
import './Input.css';

/**
 * Styled text input that extends native input behavior.
 *
 * @example
 * <Input type="email" placeholder="you@example.com" />
 */
export function Input({
  className = '',
  ...props
}: { className?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>) {
  return (
    <input
      className={['input', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
