import type { DailyPoint } from '@/types'

/** Responsive CSS bar chart with accessible labels. No chart library needed. */
export function BarChart({ points, label }: { points: readonly DailyPoint[]; label: string }) {
  const max = Math.max(1, ...points.map((point) => point.count))

  return (
    <div
      className="flex h-44 items-end gap-1 sm:gap-1.5"
      role="img"
      aria-label={`${label}: ${points.map((point) => `${point.day} = ${String(point.count)}`).join(', ')}`}
    >
      {points.map((point, index) => {
        const height = Math.round((point.count / max) * 100)
        const isLast = index === points.length - 1
        const dayNumber = point.day.slice(8, 10)
        return (
          <div key={point.day} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1">
            <span className="numeric text-center text-[10px] font-semibold">
              {point.count > 0 ? point.count : ''}
            </span>
            <div
              className={
                isLast
                  ? 'w-full rounded-t-md bg-brand-400 transition-[height] duration-300'
                  : 'w-full rounded-t-md bg-brand-300/70 transition-[height] duration-300 dark:bg-brand-700/80'
              }
              style={{ height: `${String(Math.max(height, point.count > 0 ? 4 : 1))}%` }}
              title={`${point.day}: ${String(point.count)}`}
            />
            <span className="muted numeric text-center text-[10px]">{dayNumber}</span>
          </div>
        )
      })}
    </div>
  )
}
