import type { HTMLAttributes } from 'react';
import './Progress.css';

/**
 * Horizontal progress bar that fills from 0 to 100%.
 *
 * @param value - Current progress percentage (0–100)
 *
 * @example
 * <Progress value={65} />
 */
export function Progress({
  value = 0,
  className = '',
  ...props
}: {
  value?: number;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={['progress', className].filter(Boolean).join(' ')}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className="progress__indicator"
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </div>
  );
}
