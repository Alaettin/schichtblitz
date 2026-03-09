"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ABSENCE_TYPE_LABELS } from "@/types"
import { format } from "date-fns"

interface AbsenceFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
  onCreated: () => void
}

export function AbsenceFormSheet({ open, onOpenChange, employeeId, onCreated }: AbsenceFormSheetProps) {
  const today = format(new Date(), "yyyy-MM-dd")
  const [type, setType] = useState("")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type) { setError("Abwesenheitsgrund wählen"); return }
    if (!startDate || !endDate) { setError("Datum erforderlich"); return }
    if (new Date(endDate) < new Date(startDate)) { setError("Enddatum muss nach Startdatum liegen"); return }

    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/employees/${employeeId}/absences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, startDate, endDate, note: note || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Fehler beim Speichern")
        return
      }
      // Reset and close
      setType("")
      setStartDate(today)
      setEndDate(today)
      setNote("")
      onOpenChange(false)
      onCreated()
    } catch {
      setError("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Abwesenheit eintragen</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Grund</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Grund wählen…" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ABSENCE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Von</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (e.target.value > endDate) setEndDate(e.target.value)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Bis</Label>
              <Input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notiz (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="z.B. Arzttermin, halber Tag…"
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Speichern…" : "Speichern"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
