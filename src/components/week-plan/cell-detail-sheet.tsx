"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DAY_OF_WEEK_LABELS,
  QUALIFICATION_LABELS,
  QUALIFICATION_COLORS,
  getStaffingForDay,
  totalStaffing,
} from "@/types"
import type { ShiftTemplate, AssignmentWithDetails, EmployeeWithAvailability, AbsenceWithEmployee } from "@/types"
import { Trash2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmployeePickerSheet } from "./employee-picker-sheet"

interface CellDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: ShiftTemplate
  day: string
  weekStartStr: string
  assignments: AssignmentWithDetails[]
  employees: EmployeeWithAvailability[]
  absences: AbsenceWithEmployee[]
  locationId: string
  onMutate: () => void
}

export function CellDetailSheet({
  open,
  onOpenChange,
  template,
  day,
  weekStartStr,
  assignments,
  employees,
  absences,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locationId,
  onMutate,
}: CellDetailSheetProps) {
  const { toast } = useToast()
  const [showPicker, setShowPicker] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const staffing = getStaffingForDay(template.staffing, day)
  const total = totalStaffing(staffing)

  const handleRemove = async (assignmentId: string) => {
    setRemoving(assignmentId)
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: "Fehler", description: data.error, variant: "destructive" })
        return
      }
      onMutate()
      toast({ title: "Entfernt", description: "Zuweisung wurde entfernt" })
    } catch {
      toast({ title: "Fehler", description: "Ein Fehler ist aufgetreten", variant: "destructive" })
    } finally {
      setRemoving(null)
    }
  }

  // Staffing breakdown per qualification
  const staffingEntries = Object.entries(staffing).filter(([, v]) => v && v > 0)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {template.name} · {DAY_OF_WEEK_LABELS[day]}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {/* Staffing overview */}
            <div className="flex flex-wrap gap-2">
              {staffingEntries.map(([qual, required]) => {
                const filled = assignments.filter((a) => a.qualification === qual).length
                return (
                  <Badge
                    key={qual}
                    variant="outline"
                    className={`${QUALIFICATION_COLORS[qual]}`}
                  >
                    {filled}/{required} {QUALIFICATION_LABELS[qual]}
                  </Badge>
                )
              })}
              <Badge variant="secondary">
                {assignments.length}/{total} Gesamt
              </Badge>
            </div>

            {/* Assigned employees */}
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Mitarbeiter zugewiesen
              </p>
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {a.employee.firstName[0]}
                        {a.employee.lastName[0]}
                      </div>
                      <div>
                        <span className="text-sm font-medium">
                          {a.employee.firstName} {a.employee.lastName}
                        </span>
                        <Badge
                          variant="outline"
                          className={`ml-2 text-[10px] ${QUALIFICATION_COLORS[a.qualification]}`}
                        >
                          {QUALIFICATION_LABELS[a.qualification]}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemove(a.id)}
                      disabled={removing === a.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add employee button */}
            {assignments.length < total && (
              <Button className="w-full" onClick={() => setShowPicker(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Mitarbeiter zuweisen
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {showPicker && (
        <EmployeePickerSheet
          open={showPicker}
          onOpenChange={setShowPicker}
          template={template}
          day={day}
          weekStartStr={weekStartStr}
          assignments={assignments}
          employees={employees}
          absences={absences}
          onMutate={onMutate}
        />
      )}
    </>
  )
}
