'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const MIN = 320
const MAX = 940
const DEFAULT = 420

export default function CalendarSidebarResizable({
  isOpen,
  children,
}: {
  isOpen: boolean
  children: React.ReactNode
}) {
  const [width, setWidth] = useState(DEFAULT)
  const dragging = useRef(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return

      const newWidth = window.innerWidth - e.clientX
      if (newWidth < MIN || newWidth > MAX) return

      setWidth(newWidth)
    }

    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = 'default'
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  if (!isOpen) return null

  return (
    <>
      {/* drag handle */}
      <div
        onMouseDown={() => {
          dragging.current = true
          document.body.style.cursor = 'col-resize'
        }}
        className="w-1 cursor-col-resize bg-border hover:bg-primary/40 transition"
      />

      <aside
        style={{ width }}
        className={cn(
          'h-full border-l bg-background flex-shrink-0'
        )}
      >
        {children}
      </aside>
    </>
  )
}
