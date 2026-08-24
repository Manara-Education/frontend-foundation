import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

type DivProps = { className?: string; children?: ReactNode } & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

/**
 * Container component with border and shadow for grouping related content.
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Course Title</CardTitle>
 *     <CardDescription>A brief description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content goes here</CardContent>
 *   <CardFooter>Footer actions</CardFooter>
 * </Card>
 */
export function Card({ className = '', ...props }: DivProps) {
  return <div className={['card', className].filter(Boolean).join(' ')} {...props} />;
}

export function CardHeader({ className = '', ...props }: DivProps) {
  return <div className={['card__header', className].filter(Boolean).join(' ')} {...props} />;
}

export function CardTitle({ className = '', ...props }: DivProps) {
  return <h3 className={['card__title', className].filter(Boolean).join(' ')} {...props} />;
}

export function CardDescription({ className = '', ...props }: DivProps) {
  return <p className={['card__description', className].filter(Boolean).join(' ')} {...props} />;
}

export function CardContent({ className = '', ...props }: DivProps) {
  return <div className={['card__content', className].filter(Boolean).join(' ')} {...props} />;
}

export function CardFooter({ className = '', ...props }: DivProps) {
  return <div className={['card__footer', className].filter(Boolean).join(' ')} {...props} />;
}
