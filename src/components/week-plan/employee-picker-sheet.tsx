"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  DAY_OF_WEEK_LABELS,
  QUALIFICATION_LABELS,
  QUALIFICATION_COLORS,
  AVAILABILITY_DOT_COLORS,
  getStaffingForDay,
} from "@/types"
import type { ShiftTemplate, StaffingMap, AssignmentWithDetails, EmployeeWithAvailability, AbsenceWithEmployee } from "@/types"
import { getDayDate, isAbsentOnDay, ABSENCE_TYPE_LABELS } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Check, X } from "lucide-react"

interface EmployeePickerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: ShiftTemplate
  day: string
  weekStartStr: string
  assignments: AssignmentWithDetails[]
  employees: EmployeeWithAvailability[]
  absences: AbsenceWithEmployee[]
  onMutate: () => void
}

interface CandidateInfo {
  employee: EmployeeWithAvailability
  qualification: string
  eligible: boolean
  reason?: string
  preferred: boolean
}

export function EmployeePickerSheet({
  open,
  onOpenChange,
  template,
  day,
  weekStartStr,
  assignments,
  employees,
  absences,
  onMutate,
}: EmployeePickerSheetProps) {
  const { toast } = useToast()
  const staffing = getStaffingForDay(template.staffing, day) as StaffingMap

  // Find which qualifications still need people
  const neededQuals: string[] = []
  for (const [qual, required] of Object.entries(staffing)) {
    if (!required || required <= 0) continue
    const filled = assignments.filter((a) => a.qualification === qual).length
    for (let i = filled; i < required; i++) {
      neededQuals.push(qual)
    }
  }

  // Already assigned employee IDs
  const assignedIds = new Set(assignments.map((a) => a.employeeId))

  // Build candidate list
  const candidates: CandidateInfo[] = []

  const dayDate = getDayDate(weekStartStr, day)

  for (const emp of employees) {
    if (assignedIds.has(emp.id)) continue

    // Check absence first
    const empAbsences = absences.filter((a) => a.employeeId === emp.id)
    const absent = isAbsentOnDay(empAbsences, dayDate)

    if (absent) {
      const absence = empAbsences.find((a) => {
        const start = new Date(a.startDate).setUTCHours(0, 0, 0, 0)
        const end = new Date(a.endDate).setUTCHours(23, 59, 59, 999)
        return dayDate.getTime() >= start && dayDate.getTime() <= end
      })
      const typeName = absence ? ABSENCE_TYPE_LABELS[absence.type] ?? absence.type : "Abwesend"
      candidates.push({
        employee: emp,
        qualification: emp.qualifications[0] ?? "",
        eligible: false,
        reason: `Abwesend — ${typeName}`,
        preferred: false,
      })
      continue
    }

    const avail = emp.availabilities?.find((a) => a.dayOfWeek === day)
    const isUnavailable = !avail || avail.status === "UNAVAILABLE"
    const isPreferred = avail?.status === "PREFERRED"

    // Find matching qualification needed
    const matchingQual = neededQuals.find((q) => emp.qualifications.includes(q as never))

    if (isUnavailable) {
      candidates.push({
        employee: emp,
        qualification: matchingQual ?? emp.qualifications[0] ?? "",
        eligible: false,
        reason: "Nicht verfügbar",
        preferred: false,
      })
    } else if (!matchingQual) {
      candidates.push({
        employee: emp,
        qualification: emp.qualifications[0] ?? "",
        eligible: false,
        reason: "Qualifikation nicht benötigt",
        preferred: isPreferred,
      })
    } else {
      candidates.push({
        employee: emp,
        qualification: matchingQual,
        eligible: true,
        preferred: isPreferred,
      })
    }
  }

  // Sort: eligible first, preferred first, then alphabetical
  candidates.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1
    if (a.preferred !== b.preferred) return a.preferred ? -1 : 1
    return a.employee.lastName.localeCompare(b.employee.lastName)
  })

  const handleAssign = async (candidate: CandidateInfo) => {
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftTemplateId: template.id,
          employeeId: candidate.employee.id,
          dayOfWeek: day,
          weekStart: weekStartStr,
          qualification: candidate.qualification,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: "Fehler", description: data.error, variant: "destructive" })
        return
      }

      onMutate()
      onOpenChange(false)
      toast({
        title: "Zugewiesen",
        description: `${candidate.employee.firstName} ${candidate.employee.lastName} wurde zugewiesen`,
      })
    } catch {
      toast({ title: "Fehler", description: "Ein Fehler ist aufgetreten", variant: "destructive" })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Mitarbeiter zuweisen · {DAY_OF_WEEK_LABELS[day]}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-1">
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Keine Mitarbeiter verfügbar
            </p>
          ) : (
            candidates.map((c) => (
              <button
                key={c.employee.id}
                type="button"
                disabled={!c.eligible}
                onClick={() => handleAssign(c)}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  c.eligible
                    ? "hover:bg-accent/50 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {c.employee.firstName[0]}
                  {c.employee.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {c.employee.firstName} {c.employee.lastName}
                    </span>
                    {c.preferred && (
                      <div className={`h-2 w-2 rounded-full ${AVAILABILITY_DOT_COLORS["PREFERRED"]}`} />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {c.eligible ? (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${QUALIFICATION_COLORS[c.qualification]}`}
                      >
                        {QUALIFICATION_LABELS[c.qualification]}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">{c.reason}</span>
                    )}
                  </div>
                </div>
                {c.eligible ? (
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
