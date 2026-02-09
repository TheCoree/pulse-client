'use client'

import TimeAxisIndicator from './time-axis-indicator'

const HOUR_HEIGHT = 60

export default function TimeGridTimeColumn({
  hours,
}: {
  hours: number[]
}) {
  return (
    <div className="sticky left-0 w-16 flex-shrink-0 border-r border-border bg-muted/5 z-10 relative">
      <TimeAxisIndicator startHour={hours[0]} endHour={hours[hours.length - 1]} />
      {hours.map(hour => (
        <div
          key={hour}
          className="text-[10px] text-right pr-2 text-muted-foreground font-medium pt-1"
          style={{ height: HOUR_HEIGHT }}
        >
          {hour}:00
        </div>
      ))}
    </div>
  )
}
