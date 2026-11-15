import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({
  children,
  className,
  as: Tag = 'section',
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article' | 'aside'
}) {
  return <Tag className={cn('surface p-4 sm:p-5', className)}>{children}</Tag>
}

export function CardTitle({
  children,
  action,
  id,
}: {
  children: ReactNode
  action?: ReactNode
  id?: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="text-base font-semibold sm:text-lg">
        {children}
      </h2>
      {action}
    </div>
  )
}

export function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string
  value: ReactNode
  hint?: string
  accent?: boolean
}) {
  return (
    <div className="surface flex flex-col gap-1 p-3 sm:p-4">
      <span className="muted text-xs font-medium tracking-wide uppercase">{label}</span>
      <span
        className={cn(
          'numeric text-2xl font-bold sm:text-3xl',
          accent && 'text-brand-600 dark:text-brand-300',
        )}
      >
        {value}
      </span>
      {hint ? <span className="muted text-xs">{hint}</span> : null}
    </div>
  )
}
