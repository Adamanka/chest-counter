import type { TypeCount } from '@/types'
import type { ResolvedChestType } from '@/lib/chestTypes'
import { useTypeName } from '@/hooks/useTypeName'

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Accessible donut chart drawn with plain SVG strokes. */
export function DonutChart({
  data,
  types,
  label,
}: {
  data: readonly TypeCount[]
  types: readonly ResolvedChestType[]
  label: string
}) {
  const typeName = useTypeName()
  const visible = data.filter((item) => item.count > 0)
  const total = visible.reduce((sum, item) => sum + item.count, 0)

  interface Segment {
    id: string
    color: string
    dash: number
    offset: number
    label: string
    count: number
    share: number
  }

  interface SegmentAccumulator {
    segments: Segment[]
    offset: number
  }

  const built = visible.reduce<SegmentAccumulator>(
    (accumulator, item) => {
      const type = types.find((candidate) => candidate.id === item.typeId)
      const share = total === 0 ? 0 : item.count / total
      const dash = share * CIRCUMFERENCE
      accumulator.segments.push({
        id: item.typeId,
        color: type?.color ?? '#94a3b8',
        dash,
        offset: accumulator.offset,
        label: type ? typeName(type) : item.typeId,
        count: item.count,
        share,
      })
      accumulator.offset += dash
      return accumulator
    },
    { segments: [], offset: 0 },
  )

  const segments: Segment[] = built.segments
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <svg
        viewBox="0 0 100 100"
        className="h-36 w-36 shrink-0 -rotate-90"
        role="img"
        aria-label={`${label}: ${String(total)}`}
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="14"
          className="stroke-ink-200 dark:stroke-ink-700"
        />
        {segments.map((segment) => (
          <circle
            key={segment.id}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={segment.color}
            strokeWidth="14"
            strokeDasharray={`${String(segment.dash)} ${String(CIRCUMFERENCE - segment.dash)}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>

      <ul className="w-full space-y-1.5">
        {segments.length === 0 ? (
          <li className="muted text-sm">—</li>
        ) : (
          segments.map((segment) => (
            <li key={segment.id} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="flex-1 truncate">{segment.label}</span>
              <span className="numeric font-semibold">{segment.count}</span>
              <span className="muted numeric w-10 text-right">
                {Math.round(segment.share * 100)}%
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
