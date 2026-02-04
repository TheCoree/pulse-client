'use client'

interface Calendar {
  id: number
  name: string
  description?: string
}

export default function CalendarCard({
  calendar,
}: {
  calendar: Calendar
}) {
  return (
    <div
      className="
        h-full
        rounded-lg
        border
        p-4
        bg-background
        hover:bg-muted/40
        transition
        cursor-pointer
      "
    >
      <div className="font-semibold truncate">
        {calendar.name}
      </div>

      {calendar.description && (
        <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {calendar.description}
        </div>
      )}
    </div>
  )
}
