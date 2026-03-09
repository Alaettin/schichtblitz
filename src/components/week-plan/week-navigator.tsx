"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

interface WeekNavigatorProps {
  weekLabel: string
  isCurrentWeek: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function WeekNavigator({
  weekLabel,
  isCurrentWeek,
  onPrev,
  onNext,
  onToday,
}: WeekNavigatorProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button variant="outline" size="icon" onClick={onPrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{weekLabel}</span>
        {!isCurrentWeek && (
          <Button variant="ghost" size="sm" onClick={onToday} className="h-7 px-2 text-xs">
            <CalendarDays className="h-3 w-3 mr-1" />
            Heute
          </Button>
        )}
      </div>

      <Button variant="outline" size="icon" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
