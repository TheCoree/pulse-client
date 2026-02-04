'use client'

import { format, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function TimeGridHeader({ days }: { days: Date[] }) {
  return (
    <div className="sticky top-0 z-10 flex border-b border-border bg-background">
      <div className="w-16 border-r border-border" />

      {days.map(day => (
        <div
          key={day.toISOString()}
          className="flex-1 min-w-[100px] p-2 flex items-center justify-between border-r border-border last:border-r-0 px-4"
        >
          <div
            className={cn(
              'text-lg font-semibold',
              isToday(day) &&
                'w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-sm'
            )}
          >
            {format(day, 'd')}
          </div>

          <div className="text-xs uppercase text-muted-foreground font-medium">
            {format(day, 'eeeeee', { locale: ru })}
          </div>
        </div>
      ))}
    </div>
  )
}
