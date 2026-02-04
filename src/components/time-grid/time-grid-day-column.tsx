// time-grid-day-column.tsx
'use client'

import { startOfDay, endOfDay, isToday } from 'date-fns'
import TimeGridEvent from './time-grid-event'
import TimeGridTimeline from './time-grid-timeline'

const HOUR_HEIGHT = 60

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd
}

function buildOverlapGroups(events: any[]) {
  const groups: any[][] = []

  for (const event of events) {
    const start = new Date(event.start)
    const end = new Date(event.end)

    let placed = false

    for (const group of groups) {
      if (
        group.some(e =>
          overlaps(
            start,
            end,
            new Date(e.start),
            new Date(e.end)
          )
        )
      ) {
        group.push(event)
        placed = true
        break
      }
    }

    if (!placed) {
      groups.push([event])
    }
  }

  return groups
}

export default function TimeGridDayColumn({
  day,
  events,
  now,
  startHour,
  endHour,
  totalHeight,
  onEventClick,
}: any) {
  const dayStart = startOfDay(day)
  const dayEnd = endOfDay(day)

  const dayEvents = events.filter(e => {
    const s = new Date(e.start)
    const en = new Date(e.end)
    return en > dayStart && s < dayEnd
  })

  const overlapGroups = buildOverlapGroups(dayEvents)
  const isTodayDay = isToday(day)

  return (
    <div
      className="flex-1 min-w-[100px] border-r border-border last:border-r-0 relative"
      style={{ minHeight: totalHeight }}
    >
      {/* GRID */}
      {Array.from({ length: endHour - startHour + 1 }).map((_, i) => (
        <div
          key={i}
          className="border-b border-border/40"
          style={{ height: HOUR_HEIGHT }}
        />
      ))}

      {/* LIVE TIME */}
      {isTodayDay && (
        <TimeGridTimeline
          now={now}
          startHour={startHour}
        />
      )}

      {/* EVENTS */}
      {overlapGroups.map(group =>
        group.map((event, index) => (
          <TimeGridEvent
            key={event.id}
            event={event}
            dayStart={dayStart}
            dayEnd={dayEnd}
            startHour={startHour}
            endHour={endHour}
            overlapIndex={index}
            overlapCount={group.length}
            onClick={() => onEventClick(event)}
          />
        ))
      )}
    </div>
  )
}
