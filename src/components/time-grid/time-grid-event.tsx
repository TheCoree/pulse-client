// time-grid-event.tsx
'use client'

import { max, min } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'

const HOUR_HEIGHT = 60

export default function TimeGridEvent({
  event,
  dayStart,
  dayEnd,
  startHour,
  endHour,
  overlapIndex,
  overlapCount,
  onClick,
}: any) {
  const start = max([new Date(event.start), dayStart])
  const end = min([new Date(event.end), dayEnd])

  const startH =
    start.getHours() + start.getMinutes() / 60
  const endH =
    end.getHours() + end.getMinutes() / 60

  const top = (startH - startHour) * HOUR_HEIGHT
  const height = Math.max(
    (endH - startH) * HOUR_HEIGHT,
    24
  )

  const width = 100 / overlapCount
  const left = overlapIndex * width

  return (
    <Card
      onClick={onClick}
      className="
        absolute
        p-2
        rounded-md
        border-l-4
        shadow-sm
        cursor-pointer
        bg-blue-600/20
        border-blue-500
        text-blue-100
        hover:outline-2
        transition
      "
      style={{
        top,
        height,
        width: `${width}%`,
        left: `${left}%`,
      }}
    >
      <CardContent className="p-0">
        <div className="text-[11px] font-bold truncate">
          {event.title}
        </div>
      </CardContent>
    </Card>
  )
}
