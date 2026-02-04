'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import CalendarCard from '@/components/calendar/calendar-card'

interface Calendar {
  id: number
  name: string
  description?: string
}

export default function CalendarsPage() {
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCalendars = async () => {
    try {
      setIsLoading(true)
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
    <div className="min-h-screen bg-background p-8">

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Мои календари
        </h1>

        {/* потом сюда легко добавить кнопку "Создать календарь" */}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && calendars.length === 0 && (
        <div className="text-muted-foreground">
          У вас пока нет календарей
        </div>
      )}

      {!isLoading && calendars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendars.map(cal => (
            <Link
              key={cal.id}
              href={`/calendars/${cal.id}`}
              className="block"
            >
              <CalendarCard calendar={cal} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
