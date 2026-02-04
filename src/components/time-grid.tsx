'use client'

import React, { useEffect, useState } from 'react'
import {
  format,
  isSameDay,
  startOfDay,
  endOfDay,
  max,
  min,
  isToday,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface Event {
  id: number
  title: string
  description?: string
  start: string
  end: string
  calendar_id: number
}

interface TimeGridProps {
  days: Date[]
  startHour?: number
  endHour?: number
  events: Event[]
  onEventClick: (event: Event) => void
}

const HOUR_HEIGHT = 60

export function TimeGrid({
  days,
  startHour = 0,
  endHour = 24,
  events,
  onEventClick,
}: TimeGridProps) {
  const [now, setNow] = useState(new Date())

  // 🔥 ЖИВОЕ ВРЕМЯ
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 60_000)

    return () => clearInterval(id)
  }, [])

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  )

  const totalHeight = hours.length * HOUR_HEIGHT

  return (
    <div className="flex flex-col h-full bg-background select-none">

      {/* ===== HEADER — НЕ ТРОГАЕМ ===== */}
      <div className="sticky top-0 z-10 flex border-b border-border bg-background">
        <div className="w-16 border-r border-border flex-shrink-0" />

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

      {/* ===== SCROLL ===== */}
      <div className="flex flex-1 overflow-auto relative">

        {/* TIME COLUMN */}
        <div className="sticky left-0 w-16 flex-shrink-0 border-r border-border bg-muted/5 z-10">
          {hours.map(hour => (
            <div
              key={hour}
              style={{ height: HOUR_HEIGHT }}
              className="text-[10px] text-right pr-2 text-muted-foreground font-medium pt-1"
            >
              {hour}:00
            </div>
          ))}
        </div>

        {/* GRID */}
        <div className="flex flex-1 relative">
          {days.map(day => {
            const dayStart = startOfDay(day)
            const dayEnd = endOfDay(day)
            const isTodayDay = isToday(day)

            let currentTimeTop = -1

            if (isTodayDay) {
              const h =
                now.getHours() +
                now.getMinutes() / 60 +
                now.getSeconds() / 3600

              currentTimeTop =
                (h - startHour) * HOUR_HEIGHT
            }

            return (
              <div
                key={day.toISOString()}
                className="flex-1 min-w-[100px] border-r border-border last:border-r-0 relative"
                style={{ minHeight: totalHeight }}
              >
                {/* hour lines */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="border-b border-border/40 w-full"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* 🔴 LIVE TIME LINE */}
                {isTodayDay && currentTimeTop >= 0 && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-primary z-20"
                    style={{ top: currentTimeTop }}
                  >
                    <div className="absolute -left-1 top-[-3px] w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}

                {/* EVENTS */}
                {events
                  .filter(e => {
                    const s = new Date(e.start)
                    const en = new Date(e.end)
                    return en > dayStart && s < dayEnd
                  })
                  .map(event => (
                    <EventItem
                      key={event.id}
                      event={event}
                      startHour={startHour}
                      endHour={endHour}
                      dayStart={dayStart}
                      dayEnd={dayEnd}
                      onClick={() => onEventClick(event)}
                    />
                  ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ================================================= */

function EventItem({
  event,
  startHour,
  endHour,
  dayStart,
  dayEnd,
  onClick,
}: any) {
  const start = max([new Date(event.start), dayStart])
  const end = min([new Date(event.end), dayEnd])

  const startH =
    start.getHours() + start.getMinutes() / 60
  const endH =
    end.getHours() + end.getMinutes() / 60

  const top = (startH - startHour) * 60
  const height = Math.max(
    (endH - startH) * 60,
    24
  )

  return (
    <Card
      onClick={onClick}
      className="
        absolute left-[2px] right-[2px]
        p-2 rounded-md border-l-4
        shadow-sm cursor-pointer
        bg-blue-600/20 border-blue-500 text-blue-100
      "
      style={{ top, height }}
    >
      <CardContent className="p-0">
        <div className="text-[11px] font-bold truncate">
          {event.title}
        </div>
      </CardContent>
    </Card>
  )
}
