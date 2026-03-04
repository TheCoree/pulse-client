'use client'

import { useState, useCallback, useEffect } from 'react'
import { format, setHours, setMinutes, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import api from '@/lib/api'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CorrectionOrderLightbox } from '@/components/correction/CorrectionOrderLightbox'
import EventContentEditor, { ContentBlock } from './event-content-editor'

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
  onSaved: (event: any) => void
}) {
  const startInitial = event ? new Date(event.start) : new Date()
  const endInitial = event ? new Date(event.end) : new Date(Date.now() + 60 * 60 * 1000)

  const [title, setTitle] = useState(event?.title || '')
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [loadedEventId, setLoadedEventId] = useState<number | null>(null)

  useEffect(() => {
    if (mode === 'edit' && event?.id) {
      if (loadedEventId === event.id) return // Already loaded this event, don't overwrite local edits

      if (event.contents && event.contents.length > 0) {
        setBlocks(event.contents.map((c: any) => ({
          tempId: crypto.randomUUID(),
          type: c.type,
          text: c.text ?? '',
          file_url: c.file_url ?? undefined,
          id: c.id,
        })))
        setLoadedEventId(event.id)
      } else {
        api
          .get(`/calendars/${calendarId}/events/${event.id}/content`)
          .then(res => {
            setBlocks(res.data.map((c: any) => ({
              tempId: crypto.randomUUID(),
              type: c.type,
              text: c.text ?? '',
              file_url: c.file_url ?? undefined,
              id: c.id,
            })))
            setLoadedEventId(event.id)
          })
          .catch(() => {
            setBlocks([])
            setLoadedEventId(event.id)
          })
      }
    } else if (mode === 'create') {
      setLoadedEventId(null)
    }
  }, [mode, event?.id, event?.contents, calendarId, loadedEventId])

  const [startDate, setStartDate] = useState(startInitial)
  const [startHour, setStartHour] = useState(format(startInitial, 'HH'))
  const [startMinute, setStartMinute] = useState(format(startInitial, 'mm'))

  const [endDate, setEndDate] = useState(endInitial)
  const [endHour, setEndHour] = useState(format(endInitial, 'HH'))
  const [endMinute, setEndMinute] = useState(format(endInitial, 'mm'))

  const [isSaving, setIsSaving] = useState(false)
  const [lightboxUrls, setLightboxUrls] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = useCallback((urls: string[], idx: number) => {
    setLightboxUrls(urls)
    setLightboxIndex(idx)
  }, [])

  const [deletedIds, setDeletedIds] = useState<number[]>([])

  const onRemoveBlock = (tempId: string) => {
    setBlocks(prev => {
      const block = prev.find(b => b.tempId === tempId)
      if (block?.id) {
        setDeletedIds(d => [...d, block.id!])
      }
      return prev.filter(b => b.tempId !== tempId)
    })
  }

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

    setIsSaving(true)

    try {
      let savedEventId: number
      let savedEventData: any

      if (mode === 'create') {
        const res = await api.post(`/calendars/${calendarId}/events/`, {
          title: trimmed,
          description: '',
          start: start.toISOString(),
          end: end.toISOString(),
        })
        savedEventId = res.data.id
        savedEventData = res.data
        toast.success('Событие создано')
      } else {
        const res = await api.patch(`/calendars/${calendarId}/events/${event.id}`, {
          title: trimmed,
          start: start.toISOString(),
          end: end.toISOString(),
        })
        savedEventId = event.id
        savedEventData = res.data

        // Delete blocks that were removed during editing (ignore 404)
        if (deletedIds.length > 0) {
          await Promise.allSettled(
            deletedIds.map(blockId =>
              api.delete(`/calendars/${calendarId}/events/${savedEventId}/content/${blockId}`).catch(err => {
                if (err.response?.status !== 404) throw err
              })
            )
          )
        }

        toast.success('Событие обновлено')
      }

      // Save blocks in order (Parallelized)
      const contentPromises = blocks.map(async (block, i) => {
        const order = i
        if (block.id != null) {
          // Update existing: ignore 404 in case of weird race/sync
          try {
            if (block.type === 'text') {
              await api.patch(
                `/calendars/${calendarId}/events/${savedEventId}/content/${block.id}`,
                { text: block.text, order }
              )
            } else {
              await api.patch(
                `/calendars/${calendarId}/events/${savedEventId}/content/${block.id}`,
                { order }
              )
            }
          } catch (err: any) {
            if (err.response?.status !== 404) throw err
          }
        } else {
          // Create new
          if (block.type === 'text') {
            await api.post(
              `/calendars/${calendarId}/events/${savedEventId}/content/text`,
              { text: block.text, order }
            )
          } else if ((block.type === 'image' || block.type === 'file') && block.file) {
            const formData = new FormData()
            formData.append('file', block.file)
            await api.post(
              `/calendars/${calendarId}/events/${savedEventId}/content/upload`,
              formData,
              { params: { order } }
            )
          }
        }
      })

      await Promise.all(contentPromises)

      setDeletedIds([]) // Clear on success
      onSaved(savedEventData)
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      toast.error(detail ? JSON.stringify(detail) : 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/*
        Layout:
          ┌────────────────────────┐
          │  SCROLL AREA           │  ← grows, scrolls
          │  ┌──────────────────┐  │
          │  │ Title input      │  │  ← padding inside element
          │  ├──────────────────┤  │
          │  │ Description      │  │
          │  │ (rich blocks)    │  │
          │  └──────────────────┘  │
          ├────────────────────────┤
          │  BOTTOM PANEL (fixed)  │  ← never scrolls
          │  Start  |  End         │
          │  [Cancel]   [Create]   │
          └────────────────────────┘
      */}
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* Title */}
          <div className="px-4 pt-4 pb-3 border-b border-border/60">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Введите название события..."
              className="text-lg font-semibold h-10 px-3 shadow-none focus-visible:ring-1"
            />
          </div>

          {/* Rich description */}
          <div className="px-4 py-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Описание
            </p>
            <EventContentEditor
              blocks={blocks}
              onChange={setBlocks}
              onRemove={onRemoveBlock}
              onLightboxOpen={openLightbox}
            />
          </div>

        </div>

        {/* ── FIXED BOTTOM PANEL ── */}
        <div className="flex-shrink-0 border-t border-border bg-background">

          {/* Time suggestions datalists */}
          <datalist id="hours">
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i} value={String(i).padStart(2, '0')} />
            ))}
          </datalist>
          <datalist id="minutes">
            {['00', '15', '30', '45'].map(m => (
              <option key={m} value={m} />
            ))}
          </datalist>

          {/* Start / End row */}
          <div className="grid grid-cols-2 divide-x divide-border border-b border-border">

            {/* START */}
            <div className="px-3 py-3 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Начало
              </p>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start text-sm h-8 px-2 font-normal">
                      {format(startDate, 'd MMM yy', { locale: ru })}
                    </Button>
                  }
                />
                <PopoverContent className="p-0" side="top">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={d => d && setStartDate(d)}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-1">
                <Input
                  value={startHour}
                  onChange={e => setStartHour(e.target.value)}
                  placeholder="ЧЧ"
                  list="hours"
                  className="h-8 text-sm text-center px-1"
                  maxLength={2}
                />
                <span className="text-muted-foreground text-sm">:</span>
                <Input
                  value={startMinute}
                  onChange={e => setStartMinute(e.target.value)}
                  placeholder="ММ"
                  list="minutes"
                  className="h-8 text-sm text-center px-1"
                  maxLength={2}
                />
              </div>
            </div>

            {/* END */}
            <div className="px-3 py-3 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Конец
              </p>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start text-sm h-8 px-2 font-normal">
                      {format(endDate, 'd MMM yy', { locale: ru })}
                    </Button>
                  }
                />
                <PopoverContent className="p-0" side="top">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={d => d && setEndDate(d)}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-1">
                <Input
                  value={endHour}
                  onChange={e => setEndHour(e.target.value)}
                  placeholder="ЧЧ"
                  list="hours"
                  className="h-8 text-sm text-center px-1"
                  maxLength={2}
                />
                <span className="text-muted-foreground text-sm">:</span>
                <Input
                  value={endMinute}
                  onChange={e => setEndMinute(e.target.value)}
                  placeholder="ММ"
                  list="minutes"
                  className="h-8 text-sm text-center px-1"
                  maxLength={2}
                />
              </div>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 px-4 py-3">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Отмена
            </Button>
            <Button onClick={save} disabled={isSaving}>
              {isSaving ? 'Сохранение…' : mode === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          </div>

        </div>
      </div>

      <CorrectionOrderLightbox
        isOpen={lightboxUrls.length > 0}
        onClose={() => setLightboxUrls([])}
        urls={lightboxUrls}
        initialIndex={lightboxIndex}
      />
    </>
  )
}
