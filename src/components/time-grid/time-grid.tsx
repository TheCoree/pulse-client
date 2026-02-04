'use client'

import { useLiveNow } from '@/hooks/calendar/use-live-now'
import TimeGridHeader from './time-grid-header'
import TimeGridTimeColumn from './time-grid-time-column'
import TimeGridDayColumn from './time-grid-day-column'

interface Event {
  id: number
  title: string
  start: string
  end: string
  calendar_id: number
}

interface TimeGridProps {
  days: Date[]
  startHour: number
  endHour: number
  events: Event[]
  onEventClick: (event: Event) => void
}

export default function TimeGrid({
  days,
  startHour,
  endHour,
  events,
  onEventClick,
}: TimeGridProps) {
  const now = useLiveNow()

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  )

  const totalHeight = hours.length * 60

  return (
    <div className="flex flex-col h-full bg-background select-none">

      <TimeGridHeader days={days} />

      <div className="flex flex-1 overflow-auto relative">

        <TimeGridTimeColumn hours={hours} />

        <div className="flex flex-1 relative">
          {days.map(day => (
            <TimeGridDayColumn
              key={day.toISOString()}
              day={day}
              events={events}
              now={now}
              startHour={startHour}
              endHour={endHour}
              totalHeight={totalHeight}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
