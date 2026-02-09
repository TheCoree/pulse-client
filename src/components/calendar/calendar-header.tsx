'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { RefreshCw } from '../animate-ui/icons/refresh-cw'
import { Plus } from '../animate-ui/icons/plus'
import { AnimateIcon } from '@/components/animate-ui/icons/icon'
import { Cog } from '../animate-ui/icons/cog'
import { ru } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface CalendarHeaderProps {
  numDays: number
  displayRange: string
  currentDate: Date

  startHour: number
  endHour: number

  onNumDaysChange: (value: number) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onDateSelect: (date: Date) => void
  onRefresh: () => void

  onStartHourChange: (value: number) => void
  onEndHourChange: (value: number) => void
  onCreateEvent: () => void
}

export default function CalendarHeader({
  numDays,
  displayRange,
  currentDate,
  startHour,
  endHour,
  onNumDaysChange,
  onPrev,
  onNext,
  onToday,
  onDateSelect,
  onRefresh,
  onStartHourChange,
  onEndHourChange,
  onCreateEvent
}: CalendarHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <span className="text-xl font-display tracking-tight">
          pulse ttm
        </span>

        <Input
          type="number"
          value={numDays}
          min={1}
          max={14}
          onChange={e => onNumDaysChange(Number(e.target.value))}
          className="w-20 h-9"
        />

        <div className="flex items-center bg-muted/50 rounded-md h-9">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onPrev}>
            <ChevronLeft size={18} />
          </Button>

          <Popover>
            <PopoverTrigger>
              <Button
                variant="ghost"
                className="px-3 h-9 min-w-[200px] text-sm font-medium justify-center"
              >
                {displayRange}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={date => date && onDateSelect(date)}
                locale={ru}
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onNext}>
            <ChevronRight size={18} />
          </Button>
        </div>

        <Button variant="ghost" className="h-9" onClick={onToday}>
          Сегодня
        </Button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        <Tooltip>
          <TooltipTrigger>
            <AnimateIcon animateOnHover>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={onRefresh}
              >
                <RefreshCw size={18} />
              </Button>
            </AnimateIcon>
          </TooltipTrigger>
          <TooltipContent>Обновить</TooltipContent>
        </Tooltip>


        <AnimateIcon animateOnHover className='flex items-center gap-2'>
          <Button onClick={onCreateEvent} className='h-9'>
            <Plus className="size-4" />
            <span>Событие</span>
          </Button>
        </AnimateIcon>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger>
              <DropdownMenuTrigger>
                <AnimateIcon animateOnHover>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Cog size={25} />
                  </Button>
                </AnimateIcon>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Настройки</TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold">
                Настройки отображения
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <div className="px-3 py-4 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground px-1">
                  Начало дня
                </Label>

                <Select
                  value={startHour.toString()}
                  onValueChange={v => onStartHourChange(Number(v))}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent side="right" align="start">
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground px-1">
                  Конец дня
                </Label>

                <Select
                  value={endHour.toString()}
                  onValueChange={v => onEndHourChange(Number(v))}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent side="right" align="start">
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer px-3 py-2.5">
                Экспорт календаря
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer px-3 py-2.5">
                Печать недели
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header >
  )
}
