"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DAYS_ORDERED,
  DAY_OF_WEEK_LABELS,
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_STATUS_COLORS,
} from "@/types"
import type { Availability } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface AvailabilityGridProps {
  employeeId: string
  initialData: Availability[]
}

type DayEntry = {
  dayOfWeek: string
  status: "AVAILABLE" | "UNAVAILABLE" | "PREFERRED"
  startTime: string
  endTime: string
}

const STATUS_CYCLE: DayEntry["status"][] = ["UNAVAILABLE", "AVAILABLE", "PREFERRED"]

function getNextStatus(current: DayEntry["status"]): DayEntry["status"] {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

export function AvailabilityGrid({ employeeId, initialData }: AvailabilityGridProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const buildInitial = (): DayEntry[] =>
    DAYS_ORDERED.map((day) => {
      const existing = initialData.find((a) => a.dayOfWeek === day)
      return {
        dayOfWeek: day,
        status: (existing?.status as DayEntry["status"]) ?? "UNAVAILABLE",
        startTime: existing?.startTime ?? "",
        endTime: existing?.endTime ?? "",
      }
    })

  const [entries, setEntries] = useState<DayEntry[]>(buildInitial)

  const updateEntry = (index: number, field: keyof DayEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    )
  }

  const toggleStatus = (index: number) => {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === index
          ? {
              ...e,
              status: getNextStatus(e.status),
              // Clear times when switching to UNAVAILABLE
              ...(getNextStatus(e.status) === "UNAVAILABLE"
                ? { startTime: "", endTime: "" }
                : {}),
            }
          : e
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = entries.map((e) => ({
        dayOfWeek: e.dayOfWeek,
        status: e.status,
        startTime: e.startTime || null,
        endTime: e.endTime || null,
      }))

      const res = await fetch(`/api/employees/${employeeId}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Fehler",
          description: data.error || "Verfügbarkeiten konnten nicht gespeichert werden",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Gespeichert",
        description: "Verfügbarkeiten wurden aktualisiert",
      })
    } catch {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-1">
      {entries.map((entry, index) => (
        <div
          key={entry.dayOfWeek}
          className="rounded-lg border p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {DAY_OF_WEEK_LABELS[entry.dayOfWeek]}
            </span>
            <button
              type="button"
              onClick={() => toggleStatus(index)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${AVAILABILITY_STATUS_COLORS[entry.status]}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${
                entry.status === "AVAILABLE" ? "bg-green-600" :
                entry.status === "PREFERRED" ? "bg-blue-600" :
                "bg-red-600"
              }`} />
              {AVAILABILITY_STATUS_LABELS[entry.status]}
            </button>
          </div>

          {entry.status !== "UNAVAILABLE" && (
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Von</Label>
                <Input
                  type="time"
                  value={entry.startTime}
                  onChange={(e) => updateEntry(index, "startTime", e.target.value)}
                  className="h-9"
                />
              </div>
              <span className="text-muted-foreground mt-5">–</span>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Bis</Label>
                <Input
                  type="time"
                  value={entry.endTime}
                  onChange={(e) => updateEntry(index, "endTime", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {saving ? "Speichern..." : "Verfügbarkeiten speichern"}
      </Button>
    </div>
  )
}
