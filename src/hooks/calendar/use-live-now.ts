'use client'

import { useEffect, useState } from 'react'

export function useLiveNow() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    // обновляем каждую минуту — идеально для календаря
    const id = setInterval(() => {
      setNow(new Date())
    }, 60_000)

    return () => clearInterval(id)
  }, [])

  return now
}
