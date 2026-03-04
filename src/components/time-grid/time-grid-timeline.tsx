import { useEffect, useState } from 'react'

const HOUR_HEIGHT = 60

export default function TimeGridTimeline({
  now,
  startHour,
  endHour,
  isToday,
}: {
  now: Date
  startHour: number
  endHour: number
  isToday: boolean
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const hours =
    now.getHours() +
    now.getMinutes() / 60 +
    now.getSeconds() / 3600

  if (!mounted || hours < startHour || hours > endHour) return null

  const top = (hours - startHour) * HOUR_HEIGHT

  if (!isToday) {
    return (
      <div
        className="absolute left-0 right-0 border-b border-primary/30 border-dashed z-0 pointer-events-none"
        style={{ top: `${top.toFixed(1)}px` }}
      />
    )
  }

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-primary z-20 pointer-events-none"
      style={{ top: `${top.toFixed(1)}px` }}
    >
      <div className="absolute -left-1 top-[-3px] w-2 h-2 rounded-full bg-primary" />
    </div>
  )
}
