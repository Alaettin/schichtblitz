"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AbsenceFormSheet } from "./absence-form-sheet"
import { useAbsences } from "@/hooks/use-absences"
import { ABSENCE_TYPE_LABELS, ABSENCE_TYPE_COLORS } from "@/types"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { CalendarOff, Plus, Trash2 } from "lucide-react"

interface AbsenceListProps {
  employeeId: string
}

function formatRange(startDate: string | Date, endDate: string | Date): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startStr = format(start, "dd.MM.yyyy", { locale: de })
  const endStr = format(end, "dd.MM.yyyy", { locale: de })
  return startStr === endStr ? startStr : `${format(start, "dd.MM.", { locale: de })} – ${endStr}`
}

export function AbsenceList({ employeeId }: AbsenceListProps) {
  const { absences, isLoading, mutate } = useAbsences(employeeId)
  const [showForm, setShowForm] = useState(false)

  async function handleDelete(absenceId: string) {
    const res = await fetch(`/api/employees/${employeeId}/absences/${absenceId}`, {
      method: "DELETE",
    })
    if (res.ok) mutate()
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarOff className="h-4 w-4" />
            Abwesenheiten
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Laden…</p>
          ) : absences.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Abwesenheiten eingetragen</p>
          ) : (
            <div className="space-y-2">
              {absences.map((absence) => (
                <div
                  key={absence.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className={ABSENCE_TYPE_COLORS[absence.type] ?? "bg-gray-100 text-gray-700"}>
                        {ABSENCE_TYPE_LABELS[absence.type] ?? absence.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatRange(absence.startDate, absence.endDate)}
                      </span>
                    </div>
                    {absence.note && (
                      <p className="text-xs text-muted-foreground truncate">{absence.note}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleDelete(absence.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AbsenceFormSheet
        open={showForm}
        onOpenChange={setShowForm}
        employeeId={employeeId}
        onCreated={() => mutate()}
      />
    </>
  )
}
