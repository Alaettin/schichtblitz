"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  QUALIFICATIONS_ORDERED,
  QUALIFICATION_LABELS,
  QUALIFICATION_COLORS,
  DAYS_ORDERED,
  DAY_OF_WEEK_SHORT,
  getStaffingForDay,
} from "@/types"
import type { ShiftTemplate, StaffingMap } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, Copy } from "lucide-react"

interface ShiftTemplateFormProps {
  template?: ShiftTemplate
  locationId: string
  onSuccess: () => void
  onCancel: () => void
}

type WeeklyStaffing = Record<string, Record<string, number>>

function parseWeeklyStaffing(template?: ShiftTemplate): WeeklyStaffing {
  const result: WeeklyStaffing = {}
  for (const day of DAYS_ORDERED) {
    const base: Record<string, number> = {}
    for (const q of QUALIFICATIONS_ORDERED) base[q] = 0
    if (template) {
      const dayStaffing = getStaffingForDay(template.staffing, day) as StaffingMap
      for (const [k, v] of Object.entries(dayStaffing)) {
        if (k in base) base[k] = v ?? 0
      }
    }
    result[day] = base
  }
  return result
}

export function ShiftTemplateForm({
  template,
  locationId,
  onSuccess,
  onCancel,
}: ShiftTemplateFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: template?.name ?? "",
    startTime: template?.startTime ?? "",
    endTime: template?.endTime ?? "",
  })

  const [staffing, setStaffing] = useState<WeeklyStaffing>(
    parseWeeklyStaffing(template)
  )

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const adjustStaffing = (day: string, qual: string, delta: number) => {
    setStaffing((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [qual]: Math.max(0, (prev[day]?.[qual] ?? 0) + delta),
      },
    }))
  }

  const applyToAll = () => {
    const mondayValues = staffing["MONDAY"]
    if (!mondayValues) return
    setStaffing((prev) => {
      const next = { ...prev }
      for (const day of DAYS_ORDERED) {
        next[day] = { ...mondayValues }
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build weekly staffing, filtering out 0-values per day
      const filteredStaffing: Record<string, Record<string, number>> = {}
      for (const day of DAYS_ORDERED) {
        const dayVals: Record<string, number> = {}
        for (const [k, v] of Object.entries(staffing[day] ?? {})) {
          if (v > 0) dayVals[k] = v
        }
        filteredStaffing[day] = dayVals
      }

      const payload = {
        ...form,
        staffing: filteredStaffing,
        ...(template ? {} : { locationId }),
      }

      const url = template
        ? `/api/shift-templates/${template.id}`
        : "/api/shift-templates"
      const method = template ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Fehler",
          description: data.error || "Ein Fehler ist aufgetreten",
          variant: "destructive",
        })
        return
      }

      toast({
        title: template ? "Vorlage aktualisiert" : "Vorlage erstellt",
        description: `${form.name} wurde erfolgreich ${template ? "aktualisiert" : "erstellt"}.`,
      })

      onSuccess()
    } catch {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="z.B. Frühschicht"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Beginn *</Label>
          <Input
            id="startTime"
            type="time"
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Ende *</Label>
          <Input
            id="endTime"
            type="time"
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Besetzung pro Tag *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={applyToAll}
          >
            <Copy className="h-3 w-3" />
            Mo auf alle
          </Button>
        </div>

        <div className="space-y-1">
          {DAYS_ORDERED.map((day) => (
            <div
              key={day}
              className="flex items-center gap-2 rounded-lg border p-2"
            >
              <span className="text-sm font-medium w-[28px] shrink-0">
                {DAY_OF_WEEK_SHORT[day]}
              </span>
              <div className="flex flex-wrap gap-2 flex-1">
                {QUALIFICATIONS_ORDERED.map((qual) => (
                  <div key={qual} className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1 py-0 ${QUALIFICATION_COLORS[qual]}`}
                    >
                      {QUALIFICATION_LABELS[qual]}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => adjustStaffing(day, qual, -1)}
                      disabled={(staffing[day]?.[qual] ?? 0) === 0}
                    >
                      <Minus className="h-2.5 w-2.5" />
                    </Button>
                    <span className="w-5 text-center text-sm font-medium tabular-nums">
                      {staffing[day]?.[qual] ?? 0}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => adjustStaffing(day, qual, 1)}
                    >
                      <Plus className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Speichern..." : template ? "Aktualisieren" : "Erstellen"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
