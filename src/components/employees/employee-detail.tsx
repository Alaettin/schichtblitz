"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { EmployeeForm } from "./employee-form"
import { DeleteEmployeeDialog } from "./delete-employee-dialog"
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
  QUALIFICATION_LABELS,
  QUALIFICATION_COLORS,
} from "@/types"
import type { EmployeeWithLocation } from "@/types"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Calendar, Clock, Euro } from "lucide-react"
import { AvailabilityGrid } from "./availability-grid"
import { AbsenceList } from "./absence-list"
import { useAvailability } from "@/hooks/use-availability"

interface EmployeeDetailProps {
  employee: EmployeeWithLocation
}

export function EmployeeDetail({ employee: initialEmployee }: EmployeeDetailProps) {
  const router = useRouter()
  const [employee, setEmployee] = useState(initialEmployee)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const { availabilities, isLoading: availLoading } = useAvailability(employee.id)

  const refreshEmployee = async () => {
    const res = await fetch(`/api/employees/${employee.id}`)
    const data = await res.json()
    if (data.data) setEmployee(data.data)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/team")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {employee.firstName} {employee.lastName}
          </h1>
          <Badge className={CONTRACT_TYPE_COLORS[employee.contractType]}>
            {CONTRACT_TYPE_LABELS[employee.contractType]}
          </Badge>
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowEdit(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setShowDelete(true)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {/* Info Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {employee.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{employee.email}</span>
            </div>
          )}
          {employee.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{employee.phone}</span>
            </div>
          )}
          {!employee.email && !employee.phone && (
            <p className="text-sm text-muted-foreground">Keine Kontaktdaten hinterlegt</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vertrag</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{employee.weeklyHours} Stunden/Woche</span>
          </div>
          {employee.hourlyRate && (
            <div className="flex items-center gap-3 text-sm">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span>{employee.hourlyRate.toFixed(2)} EUR/Stunde</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Seit {format(new Date(employee.startDate), "dd. MMMM yyyy", { locale: de })}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Qualifikationen</CardTitle>
        </CardHeader>
        <CardContent>
          {employee.qualifications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {employee.qualifications.map((qual) => (
                <Badge key={qual} className={QUALIFICATION_COLORS[qual]}>
                  {QUALIFICATION_LABELS[qual]}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Qualifikationen zugewiesen</p>
          )}
        </CardContent>
      </Card>

      {/* Verfügbarkeiten */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verfügbarkeiten</CardTitle>
        </CardHeader>
        <CardContent>
          {availLoading ? (
            <p className="text-sm text-muted-foreground">Laden...</p>
          ) : (
            <AvailabilityGrid key={employee.id} employeeId={employee.id} initialData={availabilities} />
          )}
        </CardContent>
      </Card>

      {/* Abwesenheiten */}
      <AbsenceList employeeId={employee.id} />

      {/* Edit Sheet */}
      <Sheet open={showEdit} onOpenChange={setShowEdit}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Mitarbeiter bearbeiten</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <EmployeeForm
              employee={employee}
              locationId={employee.locationId}
              onSuccess={() => {
                setShowEdit(false)
                refreshEmployee()
              }}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <DeleteEmployeeDialog
        employee={employee}
        open={showDelete}
        onOpenChange={setShowDelete}
        onDeleted={() => router.push("/team")}
      />
    </div>
  )
}
