import { cn } from '@/lib/cn'

export function ProgressBar({
  value,
  max,
  label,
  className,
  tone = 'brand',
}: {
  value: number
  max: number
  label: string
  className?: string
  tone?: 'brand' | 'green' | 'red'
}) {
  const safeMax = max <= 0 ? 1 : max
  const percent = Math.round(Math.min(Math.max(value / safeMax, 0), 1) * 100)
  const barTone =
    tone === 'green' ? 'bg-emerald-500' : tone === 'red' ? 'bg-red-500' : 'bg-brand-400'

  return (
    <div
      className={cn(
        'h-2.5 w-full overflow-hidden rounded-full bg-ink-200 dark:bg-ink-700',
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={Math.round(safeMax)}
      aria-valuenow={Math.round(Math.min(value, safeMax))}
      aria-valuetext={`${String(value)} / ${String(max)}`}
      aria-label={label}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-300', barTone)}
        style={{ width: `${String(percent)}%` }}
      />
    </div>
  )
}
