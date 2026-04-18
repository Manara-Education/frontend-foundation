import { useState, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from 'react';
import './Avatar.css';

type DivProps = { className?: string; children?: ReactNode } & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

/**
 * Circular avatar with image and text fallback.
 *
 * @example
 * <Avatar>
 *   <AvatarImage src="/photo.jpg" alt="User name" />
 *   <AvatarFallback>UN</AvatarFallback>
 * </Avatar>
 */
export function Avatar({ className = '', ...props }: DivProps) {
  return <div className={['avatar', className].filter(Boolean).join(' ')} {...props} />;
}

export function AvatarImage({
  className = '',
  onError,
  ...props
}: { className?: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'className'>) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <img
      className={['avatar__image', className].filter(Boolean).join(' ')}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
      {...props}
    />
  );
}

export function AvatarFallback({ className = '', ...props }: DivProps) {
  return <span className={['avatar__fallback', className].filter(Boolean).join(' ')} {...props} />;
}
