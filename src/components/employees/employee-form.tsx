"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ContractTypeSelect } from "./contract-type-select"
import { QualificationPicker } from "./qualification-picker"
import type { EmployeeWithLocation } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface EmployeeFormProps {
  employee?: EmployeeWithLocation
  locationId: string
  onSuccess: () => void
  onCancel: () => void
}

const DEFAULT_HOURS: Record<string, number> = {
  FULLTIME: 40,
  PARTTIME: 20,
  MINIJOB: 10,
}

export function EmployeeForm({
  employee,
  locationId,
  onSuccess,
  onCancel,
}: EmployeeFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    email: employee?.email ?? "",
    phone: employee?.phone ?? "",
    contractType: employee?.contractType ?? "",
    weeklyHours: employee?.weeklyHours ?? 40,
    hourlyRate: employee?.hourlyRate ?? "",
    qualifications: (employee?.qualifications as string[]) ?? [],
    startDate: employee?.startDate
      ? new Date(employee.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  })

  const update = (field: string, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Auto-set weekly hours when contract type changes
      if (field === "contractType" && typeof value === "string" && DEFAULT_HOURS[value]) {
        next.weeklyHours = DEFAULT_HOURS[value]
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...form,
        weeklyHours: Number(form.weeklyHours),
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        locationId,
      }

      const url = employee ? `/api/employees/${employee.id}` : "/api/employees"
      const method = employee ? "PUT" : "POST"

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
        title: employee ? "Mitarbeiter aktualisiert" : "Mitarbeiter erstellt",
        description: `${form.firstName} ${form.lastName} wurde erfolgreich ${employee ? "aktualisiert" : "erstellt"}.`,
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vorname *</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname *</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Vertragsart *</Label>
        <ContractTypeSelect
          value={form.contractType}
          onValueChange={(v) => update("contractType", v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weeklyHours">Wochenstunden *</Label>
          <Input
            id="weeklyHours"
            type="number"
            step="0.5"
            min="0"
            max="48"
            value={form.weeklyHours}
            onChange={(e) => update("weeklyHours", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Stundenlohn (EUR)</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            min="0"
            value={form.hourlyRate}
            onChange={(e) => update("hourlyRate", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Qualifikationen</Label>
        <QualificationPicker
          value={form.qualifications}
          onChange={(v) => update("qualifications", v)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Eintrittsdatum *</Label>
        <Input
          id="startDate"
          type="date"
          value={form.startDate}
          onChange={(e) => update("startDate", e.target.value)}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Speichern..." : employee ? "Aktualisieren" : "Erstellen"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
