'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

const HOUR_HEIGHT = 60

export default function TimeAxisIndicator({
    startHour,
    endHour,
}: {
    startHour: number
    endHour: number
}) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000) // Обновление каждую минуту
        return () => clearInterval(interval)
    }, [])

    const hours =
        now.getHours() +
        now.getMinutes() / 60

    if (hours < startHour || hours > endHour) return null

    const top = (hours - startHour) * HOUR_HEIGHT

    return (
        <div
            className="absolute right-0 z-30 translate-y-[-50%] pr-2 pointer-events-none"
            style={{ top }}
        >
            <div className="bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                {format(now, 'HH:mm')}
            </div>
        </div>
    )
}
