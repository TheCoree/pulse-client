'use client'

import { useState } from 'react'
import { format, setHours, setMinutes, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import api from '@/lib/api'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function EventForm({
  event,
  mode,
  calendarId,
  onCancel,
  onSaved,
}: {
  event: any
  mode: 'edit' | 'create'
  calendarId: string
  onCancel: () => void
  onSaved: () => void
}) {
  const startInitial = event ? new Date(event.start) : new Date()
  // ✅ при create делаем конец +1 час, чтобы не было 0 длительности
  const endInitial = event ? new Date(event.end) : new Date(Date.now() + 60 * 60 * 1000)

  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')

  const [startDate, setStartDate] = useState(startInitial)
  const [startHour, setStartHour] = useState(format(startInitial, 'HH'))
  const [startMinute, setStartMinute] = useState(format(startInitial, 'mm'))

  const [endDate, setEndDate] = useState(endInitial)
  const [endHour, setEndHour] = useState(format(endInitial, 'HH'))
  const [endMinute, setEndMinute] = useState(format(endInitial, 'mm'))

  const save = async () => {
    const trimmed = title.trim()
    if (!trimmed) {
      toast.error('Введите название')
      return
    }

    const start = setMinutes(setHours(startDate, Number(startHour)), Number(startMinute))
    const end = setMinutes(setHours(endDate, Number(endHour)), Number(endMinute))

    if (!isAfter(end, start)) {
      toast.error('Конец должен быть позже начала')
      return
    }

    const body = {
      title: trimmed,
      description: description?.trim() || '',
      start: start.toISOString(),
      end: end.toISOString(),
    }

    try {
      if (mode === 'create') {
        await api.post(`/calendars/${calendarId}/events`, body)
        toast.success('Событие создано')
      } else {
        await api.put(`/calendars/${calendarId}/events/${event.id}`, body)
        toast.success('Событие обновлено')
      }

      onSaved()
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      toast.error(detail ? JSON.stringify(detail) : 'Ошибка сохранения')
    }
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Название"
      />

      <Textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Описание"
      />

      {/* START */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Начало</div>

        <Popover>
          <PopoverTrigger>
            <Button variant="outline" className="w-full justify-start">
              {format(startDate, 'dd MMM yyyy', { locale: ru })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={d => d && setStartDate(d)}
            />
          </PopoverContent>
        </Popover>

        <div className="flex gap-2">
          <Input
            value={startHour}
            onChange={e => setStartHour(e.target.value)}
            placeholder="ЧЧ"
          />
          :
          <Input
            value={startMinute}
            onChange={e => setStartMinute(e.target.value)}
            placeholder="ММ"
          />
        </div>
      </div>

      {/* END */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Конец</div>

        <Popover>
          <PopoverTrigger>
            <Button variant="outline" className="w-full justify-start">
              {format(endDate, 'dd MMM yyyy', { locale: ru })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={d => d && setEndDate(d)}
            />
          </PopoverContent>
        </Popover>

        <div className="flex gap-2">
          <Input
            value={endHour}
            onChange={e => setEndHour(e.target.value)}
            placeholder="ЧЧ"
          />
          :
          <Input
            value={endMinute}
            onChange={e => setEndMinute(e.target.value)}
            placeholder="ММ"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>

        <Button onClick={save}>
          {mode === 'create' ? 'Создать' : 'Сохранить'}
        </Button>
      </div>
    </div>
  )
}
