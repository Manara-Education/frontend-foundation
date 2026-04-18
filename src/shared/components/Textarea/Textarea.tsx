import type { TextareaHTMLAttributes } from 'react';
import './Textarea.css';

/**
 * Styled multiline text area that extends native textarea behavior.
 *
 * @example
 * <Textarea placeholder="Write your notes..." rows={4} />
 */
export function Textarea({
  className = '',
  ...props
}: { className?: string } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>) {
  return (
    <textarea
      className={['textarea', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
