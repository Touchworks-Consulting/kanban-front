import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "../../lib/utils"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns"

export interface CalendarProps {
  selected?: Date | Date[]
  onSelect?: (date: Date | Date[] | undefined) => void
  mode?: "single" | "range"
  className?: string
}

export function Calendar({ 
  selected, 
  onSelect, 
  mode = "single", 
  className 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [rangeStart, setRangeStart] = React.useState<Date | null>(null)
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(null)

  React.useEffect(() => {
    if (mode === "range" && Array.isArray(selected)) {
      setRangeStart(selected[0] || null)
      setRangeEnd(selected[1] || null)
    }
  }, [selected, mode])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date: Date) => {
    if (mode === "single") {
      onSelect?.(date)
    } else if (mode === "range") {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(date)
        setRangeEnd(null)
        onSelect?.([date])
      } else if (rangeStart && !rangeEnd) {
        // Complete range
        const start = rangeStart
        const end = date
        if (start <= end) {
          setRangeEnd(end)
          onSelect?.([start, end])
        } else {
          setRangeStart(end)
          setRangeEnd(start)
          onSelect?.([end, start])
        }
      }
    }
  }

  const isDateSelected = (date: Date) => {
    if (mode === "single") {
      return selected instanceof Date && isSameDay(date, selected)
    } else if (mode === "range") {
      if (rangeStart && rangeEnd) {
        return (isSameDay(date, rangeStart) || isSameDay(date, rangeEnd) ||
                (date > rangeStart && date < rangeEnd))
      } else if (rangeStart) {
        return isSameDay(date, rangeStart)
      }
    }
    return false
  }

  const isDateInRange = (date: Date) => {
    if (mode === "range" && rangeStart && rangeEnd) {
      return date > rangeStart && date < rangeEnd
    }
    return false
  }

  const isRangeStart = (date: Date) => {
    return mode === "range" && rangeStart && isSameDay(date, rangeStart)
  }

  const isRangeEnd = (date: Date) => {
    return mode === "range" && rangeEnd && isSameDay(date, rangeEnd)
  }

  const renderDays = () => {
    const days = []
    let day = startDate

    while (day <= endDate) {
      const currentDay = day
      const isCurrentMonth = isSameMonth(day, monthStart)
      const isSelectedDay = isDateSelected(day)
      const isInRange = isDateInRange(day)
      const isStart = isRangeStart(day)
      const isEnd = isRangeEnd(day)
      const isTodayDate = isToday(day)

      days.push(
        <button
          key={day.toString()}
          type="button"
          onClick={() => handleDateClick(currentDay)}
          className={cn(
            "h-9 w-9 text-center text-sm font-normal transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:bg-accent focus:text-accent-foreground focus:outline-none",
            !isCurrentMonth && "text-muted-foreground opacity-50",
            isTodayDate && "bg-accent text-accent-foreground font-semibold",
            (isSelectedDay || isStart || isEnd) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            isInRange && "bg-primary/20 text-primary-foreground",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {format(day, "d")}
        </button>
      )
      day = addDays(day, 1)
    }

    return days
  }

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className={cn("p-3", className)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={previousMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={nextMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-9 w-9 text-center text-xs font-medium text-muted-foreground flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0">
        {renderDays()}
      </div>
    </div>
  )
}