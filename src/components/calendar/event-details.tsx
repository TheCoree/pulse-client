'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

export default function EventDetails({
  event,
  onEdit,
  onDelete,
}: any) {
  return (
    <div className="p-6 flex flex-col h-full">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{event.title}</h2>

        <div className="text-sm text-muted-foreground">
          {format(new Date(event.start), 'dd MMM yyyy HH:mm', { locale: ru })} —{' '}
          {format(new Date(event.end), 'dd MMM yyyy HH:mm', { locale: ru })}
        </div>

        {event.description && (
          <div className="text-sm mt-2 whitespace-pre-wrap">
            {event.description}
          </div>
        )}
      </div>

      <div className="mt-auto flex gap-2 pt-6">
        <Button onClick={onEdit}>Редактировать</Button>

        <Button variant="destructive" onClick={onDelete}>
          Удалить
        </Button>
      </div>
    </div>
  )
}
