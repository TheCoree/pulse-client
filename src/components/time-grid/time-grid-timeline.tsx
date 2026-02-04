'use client'

const HOUR_HEIGHT = 60

export default function TimeGridTimeline({
  now,
  startHour,
}: {
  now: Date
  startHour: number
}) {
  const hours =
    now.getHours() +
    now.getMinutes() / 60 +
    now.getSeconds() / 3600

  const top = (hours - startHour) * HOUR_HEIGHT

  if (top < 0) return null

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-primary z-20"
      style={{ top }}
    >
      <div className="absolute -left-1 top-[-3px] w-2 h-2 rounded-full bg-primary" />
    </div>
  )
}
