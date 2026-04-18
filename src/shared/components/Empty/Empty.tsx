import type { HTMLAttributes, ReactNode } from 'react';
import './Empty.css';

type DivProps = { className?: string; children?: ReactNode } & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

/**
 * Empty state display for when there is no data to show.
 *
 * @example
 * <Empty>
 *   <EmptyHeader>
 *     <EmptyMedia variant="icon"><BookIcon /></EmptyMedia>
 *     <EmptyTitle>No courses yet</EmptyTitle>
 *     <EmptyDescription>Start by creating your first course.</EmptyDescription>
 *   </EmptyHeader>
 *   <EmptyContent>
 *     <Button>Create Course</Button>
 *   </EmptyContent>
 * </Empty>
 */
export function Empty({ className = '', ...props }: DivProps) {
  return <div className={['empty', className].filter(Boolean).join(' ')} {...props} />;
}

export function EmptyHeader({ className = '', ...props }: DivProps) {
  return <div className={['empty__header', className].filter(Boolean).join(' ')} {...props} />;
}

type EmptyMediaVariant = 'default' | 'icon';

export function EmptyMedia({
  variant = 'default',
  className = '',
  ...props
}: { variant?: EmptyMediaVariant } & DivProps) {
  const classes = [
    'empty__media',
    variant === 'icon' ? 'empty__media--icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} {...props} />;
}

export function EmptyTitle({ className = '', ...props }: DivProps) {
  return <div className={['empty__title', className].filter(Boolean).join(' ')} {...props} />;
}

export function EmptyDescription({
  className = '',
  ...props
}: { className?: string; children?: ReactNode } & Omit<HTMLAttributes<HTMLParagraphElement>, 'className'>) {
  return <p className={['empty__description', className].filter(Boolean).join(' ')} {...props} />;
}

export function EmptyContent({ className = '', ...props }: DivProps) {
  return <div className={['empty__content', className].filter(Boolean).join(' ')} {...props} />;
}
