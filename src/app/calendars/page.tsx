'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import CalendarCard, { Calendar } from '@/components/calendar/calendar-card'
import AppHeader from '@/components/app-header'
import CreateCalendarDialog from '@/components/calendar/create-calendar-dialog'

export default function CalendarsPage() {
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCalendars = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const res = await api.get('/calendars/my')
      setCalendars(res.data)
    } catch {
      toast.error('Не удалось загрузить календари')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendars()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-tight">
              Мои календари
            </h1>
            <p className="text-muted-foreground mt-1">
              Управляйте вашими событиями и расписаниями
            </p>
          </div>

          <CreateCalendarDialog onSuccess={fetchCalendars} />
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && calendars.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border rounded-xl border-dashed bg-muted/20">
            <p className="text-muted-foreground mb-4">
              У вас пока нет календарей
            </p>
            <CreateCalendarDialog onSuccess={fetchCalendars} />
          </div>
        )}

        {!isLoading && calendars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {calendars.map(cal => (
              <CalendarCard key={cal.id} calendar={cal} onRefresh={() => fetchCalendars(true)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
