'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { toast } from 'sonner'
import {
  format,
  addDays,
  subDays,
  startOfDay,
  isSameMonth,
  startOfToday,
  startOfWeek,
} from 'date-fns'
import { ru } from 'date-fns/locale'

import CalendarHeader from '@/components/calendar/calendar-header'
import CalendarGrid from './calendar-grid'
import CalendarSidebar from './calendar-sidebar'
import CalendarSidebarResizable from './calendar-sidebar-resizable'
import { Loader2 } from 'lucide-react'

interface Event {
  id: number
  title: string
  description?: string
  start: string
  end: string
  calendar_id: number
}

export default function CalendarWorkspace() {
  const { calendarId } = useParams<{ calendarId: string }>()

  const [currentDate, setCurrentDate] = useState(
    startOfWeek(startOfToday(), { weekStartsOn: 1 })
  )

  const [numDays, setNumDays] = useState(7)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(21)

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [mode, setMode] =
    useState<'empty' | 'view' | 'edit' | 'create'>('empty')

  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* ======================= */

  const start = startOfDay(currentDate)
  const end = addDays(start, numDays - 1)
  const days = Array.from({ length: numDays }, (_, i) =>
    addDays(start, i)
  )

  const displayRange =
    numDays === 1
      ? format(start, 'd MMMM yyyy', { locale: ru })
      : isSameMonth(start, end)
        ? `${format(start, 'd', { locale: ru })} — ${format(end, 'd MMMM yyyy', { locale: ru })}`
        : `${format(start, 'd MMM', { locale: ru })} — ${format(end, 'd MMM yyyy', { locale: ru })}`

  /* ======================= */

  const fetchEvents = async () => {
    try {
      setIsLoading(true)

      const res = await api.get(
        `/calendars/${calendarId}/events/range`,
        {
          params: {
            from_date: format(start, "yyyy-MM-dd'T'00:00:00"),
            to_date: format(addDays(end, 1), "yyyy-MM-dd'T'00:00:00"),
          },
        }
      )

      setEvents(res.data)
    } catch {
      toast.error('Ошибка загрузки событий')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentDate, numDays, calendarId])

  /* ======================= */

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return

    try {
      await api.delete(
        `/calendars/${calendarId}/events/${selectedEvent.id}`
      )

      toast.success('Событие удалено')

      await fetchEvents()

      setSelectedEvent(null)
      setMode('empty')
      setSidebarOpen(false)
    } catch {
      toast.error('Ошибка удаления')
    }
  }

  const handleSaved = async () => {
    await fetchEvents()
    setMode('empty')
    setSidebarOpen(false)
  }

  /* ======================= */

  return (
    <div className="flex flex-col h-screen">

      <CalendarHeader
        numDays={numDays}
        displayRange={displayRange}
        currentDate={currentDate}
        startHour={startHour}
        endHour={endHour}
        onNumDaysChange={setNumDays}
        onPrev={() => setCurrentDate(subDays(currentDate, numDays))}
        onNext={() => setCurrentDate(addDays(currentDate, numDays))}
        onToday={() => setCurrentDate(startOfToday())}
        onDateSelect={setCurrentDate}
        onRefresh={fetchEvents}
        onStartHourChange={setStartHour}
        onEndHourChange={setEndHour}
        onCreateEvent={() => {
          setMode('create')
          setSidebarOpen(true)
          setSelectedEvent(null)
        }}
      />

      <main className="flex flex-1 overflow-hidden">

        <div className="flex-auto min-w-0">
          <CalendarGrid
            days={days}
            events={events}
            startHour={startHour}
            endHour={endHour}
            onEventClick={(e) => {
              setSelectedEvent(e)
              setMode('view')
              setSidebarOpen(true)
            }}
          />
        </div>

        <CalendarSidebarResizable isOpen={sidebarOpen}>
          <CalendarSidebar
            mode={mode}
            selectedEvent={selectedEvent}
            onEdit={() => setMode('edit')}
            onCreate={() => setMode('create')}
            onClose={() => {
              setSidebarOpen(false)
              setMode('empty')
              setSelectedEvent(null)
            }}
            onDelete={handleDeleteEvent}
            onSaved={handleSaved}
            calendarId={calendarId}
          />
        </CalendarSidebarResizable>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </main>
    </div>
  )
}
