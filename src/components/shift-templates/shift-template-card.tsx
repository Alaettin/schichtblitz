"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  DAYS_ORDERED,
  DAY_OF_WEEK_SHORT,
  getStaffingForDay,
  totalStaffing,
} from "@/types"
import type { ShiftTemplate } from "@/types"
import { Clock, Users } from "lucide-react"

interface ShiftTemplateCardProps {
  template: ShiftTemplate
  onClick?: () => void
}

/** Groups consecutive days with same total into ranges like "Mo–Fr: 3 MA" */
function buildStaffingSummary(template: ShiftTemplate): string {
  const dayTotals = DAYS_ORDERED.map((day) => ({
    day,
    total: totalStaffing(getStaffingForDay(template.staffing, day)),
  }))

  const groups: { days: string[]; total: number }[] = []
  for (const { day, total } of dayTotals) {
    const last = groups[groups.length - 1]
    if (last && last.total === total) {
      last.days.push(day)
    } else {
      groups.push({ days: [day], total })
    }
  }

  return groups
    .map((g) => {
      const label =
        g.days.length === 1
          ? DAY_OF_WEEK_SHORT[g.days[0]]
          : `${DAY_OF_WEEK_SHORT[g.days[0]]}–${DAY_OF_WEEK_SHORT[g.days[g.days.length - 1]]}`
      return `${label}: ${g.total === 0 ? "–" : g.total + " MA"}`
    })
    .join(" · ")
}

export function ShiftTemplateCard({ template, onClick }: ShiftTemplateCardProps) {
  const summary = buildStaffingSummary(template)

  return (
    <Card
      className="transition-colors hover:bg-accent/50 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{template.name}</div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>{template.startTime} – {template.endTime}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Users className="h-3 w-3" />
            {summary}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
