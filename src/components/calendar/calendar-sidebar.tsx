'use client'

import EventDetails from './event-details'
import EventForm from './event-form'

type Mode = 'empty' | 'view' | 'edit' | 'create'

interface Props {
  mode: Mode
  selectedEvent: any
  calendarId: string

  onEdit: () => void
  onCreate: () => void
  onClose: () => void
  onDelete: () => void
  onSaved: (event: any) => void
}

export default function CalendarSidebar({
  mode,
  selectedEvent,
  calendarId,
  onEdit,
  onCreate,
  onClose,
  onDelete,
  onSaved,
}: Props) {
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">

      {/* HEADER — always visible */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0 h-[45px]">
        <span className="font-semibold">
          {mode === 'create'
            ? 'Создание события'
            : mode === 'edit'
              ? 'Редактирование'
              : mode === 'view'
                ? 'Событие'
                : 'Календарь'}
        </span>

        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {/* CONTENT — fills remaining height; each child manages its own scroll */}
      <div className="flex-1 min-h-0">

        {mode === 'empty' && (
          <div className="p-4 text-muted-foreground text-sm">
            Выберите событие или создайте новое
          </div>
        )}

        {mode === 'view' && selectedEvent && (
          <EventDetails
            event={selectedEvent}
            calendarId={calendarId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}

        {(mode === 'edit' || mode === 'create') && (
          <EventForm
            event={mode === 'edit' ? selectedEvent : null}
            mode={mode}
            calendarId={calendarId}
            onCancel={onClose}
            onSaved={onSaved}
          />
        )}

      </div>
    </div>
  )
}
