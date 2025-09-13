import * as React from "react"
import { CalendarDays, X } from "lucide-react"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Calendar } from "./calendar"
import { cn } from "../../lib/utils"
import { format } from "date-fns"

interface DateRange {
  start: Date
  end: Date
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  inModal?: boolean // Para ajustar comportamento quando usado em modais
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Selecionar período personalizado",
  className,
  inModal = false
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedRange, setSelectedRange] = React.useState<Date[]>([])

  React.useEffect(() => {
    if (value) {
      setSelectedRange([value.start, value.end])
    } else {
      setSelectedRange([])
    }
  }, [value])

  const handleCalendarSelect = (dates: Date[] | Date | undefined) => {
    if (Array.isArray(dates)) {
      setSelectedRange(dates)
      if (dates.length === 2) {
        const dateRange = {
          start: dates[0],
          end: dates[1]
        };
        onChange?.(dateRange)
        setIsOpen(false)
      } else if (dates.length === 1) {
        // First date selected, keep picker open
      }
    }
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRange([])
    onChange?.(undefined)
  }

  const formatDateRange = () => {
    if (!value) return placeholder
    
    const startDate = format(value.start, "dd/MM/yyyy")
    const endDate = format(value.end, "dd/MM/yyyy")
    
    return `${startDate} - ${endDate}`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal w-full",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          <span className="flex-1">{formatDateRange()}</span>
          {value && (
            <X 
              className="ml-2 h-4 w-4 hover:bg-muted rounded p-0.5 cursor-pointer" 
              onClick={clearSelection}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0", 
          inModal ? "z-[60]" : "z-50"
        )} 
        align="start" 
        side="bottom" 
        sideOffset={4}
      >
        <div className="p-3 border-b">
          <div className="text-sm font-medium text-center">
            Selecione um período personalizado
          </div>
          <div className="text-xs text-muted-foreground text-center mt-1">
            Clique na data inicial e depois na data final
          </div>
        </div>
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={handleCalendarSelect}
          className="w-auto"
        />
        {selectedRange.length === 1 && (
          <div className="p-3 border-t bg-muted/20">
            <div className="text-xs text-center text-muted-foreground">
              Data inicial selecionada: {format(selectedRange[0], "dd/MM/yyyy")}
              <br />
              Agora selecione a data final
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}