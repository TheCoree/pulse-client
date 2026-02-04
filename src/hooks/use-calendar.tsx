import { useState, useMemo } from 'react';
import { startOfWeek, addDays, eachDayOfInterval, format, startOfDay, endOfDay } from 'date-fns';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = addDays(start, 6);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

  // Формируем диапазон в формате ISO 8601 для FastAPI
  const dateRange = useMemo(() => ({
    from: startOfDay(days[0]).toISOString(), // 2026-01-19T00:00:00.000Z
    to: endOfDay(days[6]).toISOString(),     // 2026-01-25T23:59:59.999Z
  }), [days]);

  return { days, currentDate, nextWeek, prevWeek, dateRange };
}