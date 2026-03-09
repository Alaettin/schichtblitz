"use client"

import { useState } from "react"
import { WeekNavigator } from "./week-navigator"
import { WeekPlanGrid } from "./week-plan-grid"
import { CellDetailSheet } from "./cell-detail-sheet"
import { AutoScheduleButton } from "./auto-schedule-button"
import { WeekExportButton } from "./week-export-button"
import { ScheduleWarnings } from "./schedule-warnings"
import { EmployeeHoursOverview } from "./employee-hours-overview"
import { useWeekNavigation } from "@/hooks/use-week-navigation"
import { useAssignments } from "@/hooks/use-assignments"
import { useShiftTemplates } from "@/hooks/use-shift-templates"
import { useEmployees } from "@/hooks/use-employees"
import { useAbsencesForWeek } from "@/hooks/use-absences"
import type { ShiftTemplate, ScheduleWarning } from "@/types"
import { getStaffingForDay, totalStaffing, getDayDate, isAbsentOnDay, ABSENCE_TYPE_LABELS } from "@/types"

interface WeekPlanContainerProps {
  locationId: string
  initialTemplates: ShiftTemplate[]
}

export function WeekPlanContainer({ locationId, initialTemplates }: WeekPlanContainerProps) {
  const { weekStartStr, weekLabel, isCurrentWeek, goNext, goPrev, goToday } = useWeekNavigation()
  const { templates } = useShiftTemplates(locationId)
  const { assignments, mutate: mutateAssignments } = useAssignments(locationId, weekStartStr)
  const { employees } = useEmployees(locationId)
  const { absences } = useAbsencesForWeek(locationId, weekStartStr)

  const [selectedCell, setSelectedCell] = useState<{ templateId: string; day: string } | null>(null)

  const activeTemplates = (templates.length > 0 ? templates : initialTemplates).filter(
    (t) => t.isActive
  )

  // Compute warnings
  const warnings: ScheduleWarning[] = []
  for (const template of activeTemplates) {
    for (const day of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]) {
      const dayStaffing = getStaffingForDay(template.staffing, day)
      const total = totalStaffing(dayStaffing)
      if (total === 0) continue
      const filled = assignments.filter(
        (a) => a.shiftTemplateId === template.id && a.dayOfWeek === day
      ).length
      if (filled < total) {
        warnings.push({
          type: "understaffed",
          message: `${template.name} (${day.charAt(0) + day.slice(1).toLowerCase()}): ${filled}/${total} besetzt`,
          templateId: template.id,
          day,
        })
      }
    }
  }

  // Check over-scheduled employees
  const employeeHours = new Map<string, number>()
  for (const a of assignments) {
    const template = activeTemplates.find((t) => t.id === a.shiftTemplateId)
    if (!template) continue
    const start = timeToMinutes(template.startTime)
    const end = timeToMinutes(template.endTime)
    const hours = (end > start ? end - start : 1440 - start + end) / 60
    employeeHours.set(a.employeeId, (employeeHours.get(a.employeeId) ?? 0) + hours)
  }
  for (const emp of employees) {
    const hours = employeeHours.get(emp.id) ?? 0
    if (hours > emp.weeklyHours) {
      warnings.push({
        type: "overscheduled",
        message: `${emp.firstName} ${emp.lastName}: ${hours.toFixed(1)}h / ${emp.weeklyHours}h Wochenstunden`,
        employeeId: emp.id,
      })
    }
  }

  // Check assigned employees with absences
  for (const a of assignments) {
    const dayDate = getDayDate(weekStartStr, a.dayOfWeek)
    const empAbsences = absences.filter((ab) => ab.employeeId === a.employeeId)
    if (isAbsentOnDay(empAbsences, dayDate)) {
      const emp = employees.find((e) => e.id === a.employeeId)
      const absence = empAbsences.find((ab) => {
        const start = new Date(ab.startDate).setUTCHours(0, 0, 0, 0)
        const end = new Date(ab.endDate).setUTCHours(23, 59, 59, 999)
        return dayDate.getTime() >= start && dayDate.getTime() <= end
      })
      if (emp) {
        const typeName = absence ? ABSENCE_TYPE_LABELS[absence.type] ?? absence.type : "Abwesend"
        warnings.push({
          type: "absent-assigned",
          message: `${emp.firstName} ${emp.lastName} (${a.dayOfWeek.charAt(0) + a.dayOfWeek.slice(1).toLowerCase()}): ${typeName} — aber eingeplant`,
          employeeId: emp.id,
          day: a.dayOfWeek,
        })
      }
    }
  }

  const selectedTemplate = selectedCell
    ? activeTemplates.find((t) => t.id === selectedCell.templateId)
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <WeekNavigator
          weekLabel={weekLabel}
          isCurrentWeek={isCurrentWeek}
          onPrev={goPrev}
          onNext={goNext}
          onToday={goToday}
        />
        <div className="flex items-center gap-2">
          <WeekExportButton
            weekLabel={weekLabel}
            templates={activeTemplates}
            assignments={assignments}
          />
          <AutoScheduleButton
            locationId={locationId}
            weekStartStr={weekStartStr}
            onScheduled={mutateAssignments}
          />
        </div>
      </div>

      {warnings.length > 0 && <ScheduleWarnings warnings={warnings} />}

      <WeekPlanGrid
        templates={activeTemplates}
        assignments={assignments}
        absences={absences}
        weekStartStr={weekStartStr}
        onCellClick={(templateId, day) => setSelectedCell({ templateId, day })}
      />

      <EmployeeHoursOverview
        assignments={assignments}
        employees={employees}
        templates={activeTemplates}
      />

      {selectedCell && selectedTemplate && (
        <CellDetailSheet
          open={!!selectedCell}
          onOpenChange={(open) => !open && setSelectedCell(null)}
          template={selectedTemplate}
          day={selectedCell.day}
          weekStartStr={weekStartStr}
          assignments={assignments.filter(
            (a) =>
              a.shiftTemplateId === selectedCell.templateId && a.dayOfWeek === selectedCell.day
          )}
          employees={employees}
          absences={absences}
          locationId={locationId}
          onMutate={mutateAssignments}
        />
      )}
    </div>
  )
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}
