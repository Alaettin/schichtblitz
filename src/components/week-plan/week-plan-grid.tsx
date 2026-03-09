"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  DAYS_ORDERED,
  DAY_OF_WEEK_SHORT,
  getStaffingForDay,
  totalStaffing,
} from "@/types"
import type { ShiftTemplate, AssignmentWithDetails, AbsenceWithEmployee } from "@/types"
import { getDayDate, isAbsentOnDay } from "@/types"
import { Users, CalendarOff } from "lucide-react"

interface WeekPlanGridProps {
  templates: ShiftTemplate[]
  assignments: AssignmentWithDetails[]
  absences: AbsenceWithEmployee[]
  weekStartStr: string
  onCellClick: (templateId: string, day: string) => void
}

function getCellStatus(filled: number, required: number): "full" | "partial" | "empty" {
  if (filled >= required) return "full"
  if (filled > 0) return "partial"
  return "empty"
}

const STATUS_COLORS = {
  full: "bg-green-50 border-green-200 hover:bg-green-100",
  partial: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  empty: "border-dashed hover:bg-muted/50",
}

export function WeekPlanGrid({ templates, assignments, absences, weekStartStr, onCellClick }: WeekPlanGridProps) {
  if (templates.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Keine Schichtvorlagen vorhanden. Erstelle zuerst Vorlagen unter Einstellungen.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[640px]">
        {/* Header row */}
        <div className="grid grid-cols-[140px_repeat(7,1fr)] gap-1 mb-2">
          <div className="text-sm font-medium text-muted-foreground p-2">Schicht</div>
          {DAYS_ORDERED.map((day) => (
            <div
              key={day}
              className="text-sm font-medium text-center p-2 text-muted-foreground"
            >
              {DAY_OF_WEEK_SHORT[day]}
            </div>
          ))}
        </div>

        {/* Template rows */}
        {templates.map((template) => (
          <div
            key={template.id}
            className="grid grid-cols-[140px_repeat(7,1fr)] gap-1 mb-1"
          >
            {/* Template info */}
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="font-medium text-sm truncate">{template.name}</div>
              <div className="text-xs text-muted-foreground">
                {template.startTime} – {template.endTime}
              </div>
            </div>

            {/* Day cells */}
            {DAYS_ORDERED.map((day) => {
              const dayStaffing = getStaffingForDay(template.staffing, day)
              const total = totalStaffing(dayStaffing)
              const cellAssignments = assignments.filter(
                (a) => a.shiftTemplateId === template.id && a.dayOfWeek === day
              )
              const filled = cellAssignments.length

              // Count absent employees for this day
              const dayDate = getDayDate(weekStartStr, day)
              const absentCount = absences.filter((a) => isAbsentOnDay([a], dayDate)).length

              if (total === 0) {
                return (
                  <Card key={day} className="border-dashed opacity-40">
                    <CardContent className="flex flex-col items-center justify-center p-2 min-h-[72px]">
                      <span className="text-xs text-muted-foreground">–</span>
                    </CardContent>
                  </Card>
                )
              }

              const status = getCellStatus(filled, total)

              return (
                <Card
                  key={day}
                  className={`cursor-pointer transition-colors ${STATUS_COLORS[status]}`}
                  onClick={() => onCellClick(template.id, day)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-2 min-h-[72px]">
                    <Users className={`h-4 w-4 mb-1 ${
                      status === "full"
                        ? "text-green-600"
                        : status === "partial"
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`} />
                    <span className={`text-sm font-medium ${
                      status === "full"
                        ? "text-green-700"
                        : status === "partial"
                        ? "text-amber-700"
                        : "text-muted-foreground"
                    }`}>
                      {filled}/{total}
                    </span>
                    {absentCount > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-red-500 mt-0.5">
                        <CalendarOff className="h-3 w-3" />
                        {absentCount}
                      </span>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
