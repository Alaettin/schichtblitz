"use client"

import { DAYS_ORDERED, DAY_OF_WEEK_SHORT, AVAILABILITY_DOT_COLORS } from "@/types"
import type { Availability } from "@/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AvailabilityBadgeProps {
  availabilities: Availability[]
}

export function AvailabilityBadge({ availabilities }: AvailabilityBadgeProps) {
  const statusMap = new Map(availabilities.map((a) => [a.dayOfWeek, a.status]))

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex gap-1">
            {DAYS_ORDERED.map((day) => {
              const status = statusMap.get(day)
              const color = status ? AVAILABILITY_DOT_COLORS[status] : "bg-gray-300"
              return (
                <div
                  key={day}
                  className={`h-2 w-2 rounded-full ${color}`}
                />
              )
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex gap-2 text-xs">
            {DAYS_ORDERED.map((day) => {
              const status = statusMap.get(day)
              const color = status ? AVAILABILITY_DOT_COLORS[status] : "bg-gray-300"
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-muted-foreground">{DAY_OF_WEEK_SHORT[day]}</span>
                  <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                </div>
              )
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
