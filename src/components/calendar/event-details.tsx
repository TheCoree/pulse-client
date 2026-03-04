'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CorrectionOrderLightbox } from '@/components/correction/CorrectionOrderLightbox'
import api from '@/lib/api'
import { CalendarDays, FileIcon, Download } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ContentBlock {
  id: number
  order: number
  type: 'text' | 'image' | 'file'
  text?: string
  file_url?: string
}

export default function EventDetails({
  event,
  calendarId,
  onEdit,
  onDelete,
}: any) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [lightboxUrls, setLightboxUrls] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    if (!event?.id) return
    api
      .get(`/calendars/${calendarId}/events/${event.id}/content`)
      .then(res => setBlocks(res.data))
      .catch(() => setBlocks([]))
  }, [event?.id, calendarId])

  const imageUrls = blocks
    .filter(b => b.type === 'image' && b.file_url)
    .map(b => `${process.env.NEXT_PUBLIC_API_URL}${b.file_url}`)

  const openLightbox = (fileUrl: string) => {
    const idx = imageUrls.findIndex(u => u.endsWith(fileUrl.split('/').pop()!))
    setLightboxIndex(Math.max(0, idx))
    setLightboxUrls(imageUrls)
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-4 min-h-0">
          {/* Title */}
          <h2 className="text-xl font-semibold leading-tight">{event.title}</h2>

          {/* Time range */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 flex-shrink-0" />
            <span>
              {format(new Date(event.start), 'dd MMM yyyy, HH:mm', { locale: ru })}
              {' — '}
              {format(new Date(event.end), 'dd MMM yyyy, HH:mm', { locale: ru })}
            </span>
          </div>

          {/* Content blocks */}
          {blocks.length > 0 && (
            <div className="space-y-3 pt-1">
              {blocks.map(block => (
                <div key={block.id}>
                  {block.type === 'text' && block.text && (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{block.text}</p>
                  )}
                  {block.type === 'image' && block.file_url && (
                    <div
                      className="relative h-44 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openLightbox(block.file_url!)}
                    >
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${block.file_url}`}
                        alt="attachment"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  {block.type === 'file' && block.file_url && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}${block.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors group/file text-zinc-900 dark:text-zinc-100"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background border border-border text-muted-foreground group-hover/file:text-foreground transition-colors">
                        <FileIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {block.text || 'Документ'}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          Нажмите, чтобы открыть или скачать
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover/file:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border bg-background flex-shrink-0">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  Удалить
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить событие?</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы действительно хотите удалить это событие? Эту операцию нельзя будет отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={onEdit}>Редактировать</Button>
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
