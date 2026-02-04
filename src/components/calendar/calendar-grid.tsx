'use client'

import TimeGrid from '@/components/time-grid/time-grid'

interface Event {
  id: number
  title: string
  start: string
  end: string
  calendar_id: number
}

interface CalendarGridProps {
  days: Date[]
  events: Event[]
  startHour: number
  endHour: number
  onEventClick: (event: Event) => void
}

export default function CalendarGrid({
  days,
  events,
  startHour,
  endHour,
  onEventClick,
}: CalendarGridProps) {
  return (
    <TimeGrid
      days={days}
      events={events}
      startHour={startHour}
      endHour={endHour}
      onEventClick={onEventClick}
    />
  )
}
