"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AssignmentWithDetails, EmployeeWithAvailability, ShiftTemplate } from "@/types"
import { QUALIFICATION_LABELS, QUALIFICATION_COLORS } from "@/types"
import { Clock } from "lucide-react"

interface EmployeeHoursOverviewProps {
  assignments: AssignmentWithDetails[]
  employees: EmployeeWithAvailability[]
  templates: ShiftTemplate[]
}

function shiftDurationHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  const start = sh * 60 + sm
  const end = eh * 60 + em
  const minutes = end > start ? end - start : 1440 - start + end
  return minutes / 60
}

interface EmployeeRow {
  id: string
  name: string
  qualifications: string[]
  planned: number
  target: number
  percentage: number
  isOver: boolean
}

export function EmployeeHoursOverview({
  assignments,
  employees,
  templates,
}: EmployeeHoursOverviewProps) {
  const [filter, setFilter] = useState<string | null>(null)

  // Build hours map
  const hoursMap = new Map<string, number>()
  for (const a of assignments) {
    const template = templates.find((t) => t.id === a.shiftTemplateId)
    if (!template) continue
    const hours = shiftDurationHours(template.startTime, template.endTime)
    hoursMap.set(a.employeeId, (hoursMap.get(a.employeeId) ?? 0) + hours)
  }

  // All employees
  const rows: EmployeeRow[] = employees.map((emp) => {
    const planned = hoursMap.get(emp.id) ?? 0
    const target = emp.weeklyHours
    const percentage = target > 0 ? Math.round((planned / target) * 100) : planned > 0 ? 100 : 0
    return {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      qualifications: emp.qualifications as string[],
      planned,
      target,
      percentage,
      isOver: planned > target,
    }
  })

  // Filter by qualification
  const filtered = filter
    ? rows.filter((r) => r.qualifications.includes(filter))
    : rows

  // Sort: over-scheduled first, then by percentage descending, then unplanned last
  filtered.sort((a, b) => {
    if (a.isOver !== b.isOver) return a.isOver ? -1 : 1
    if ((a.planned === 0) !== (b.planned === 0)) return a.planned === 0 ? 1 : -1
    return b.percentage - a.percentage
  })

  // Collect all qualifications present
  const allQuals = Array.from(new Set(employees.flatMap((e) => e.qualifications as string[]))).sort()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Stunden-Übersicht
        </CardTitle>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          <button
            onClick={() => setFilter(null)}
            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
              filter === null ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Alle
          </button>
          {allQuals.map((q) => (
            <button
              key={q}
              onClick={() => setFilter(filter === q ? null : q)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                filter === q ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {QUALIFICATION_LABELS[q] ?? q}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {filtered.map((row) => (
          <div key={row.id} className="flex items-center gap-3">
            <div className="w-[140px] shrink-0">
              <span className="text-sm truncate block">{row.name}</span>
              <div className="flex gap-1 mt-0.5">
                {row.qualifications.map((q) => (
                  <span
                    key={q}
                    className={`text-[10px] px-1 py-px rounded ${QUALIFICATION_COLORS[q] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {QUALIFICATION_LABELS[q] ?? q}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    row.isOver
                      ? "bg-red-500"
                      : row.planned === 0
                        ? "bg-gray-300"
                        : row.percentage >= 80
                          ? "bg-green-500"
                          : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(row.percentage, 100)}%` }}
                />
              </div>
            </div>
            <span
              className={`text-xs font-medium w-[80px] text-right ${
                row.isOver
                  ? "text-red-600"
                  : row.planned === 0
                    ? "text-muted-foreground/50"
                    : "text-muted-foreground"
              }`}
            >
              {row.planned.toFixed(0)}h / {row.target}h
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
