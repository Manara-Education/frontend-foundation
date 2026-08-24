import type { HTMLAttributes } from 'react';
import './Skeleton.css';

/**
 * Pulsing placeholder block used while content is loading.
 * Set dimensions via className or inline style.
 *
 * @example
 * <Skeleton style={{ width: '100%', height: '1rem' }} />
 */
export function Skeleton({
  className = '',
  ...props
}: { className?: string } & Omit<HTMLAttributes<HTMLDivElement>, 'className'>) {
  return (
    <div
      className={['skeleton', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
