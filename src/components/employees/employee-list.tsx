"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { EmployeeCard } from "./employee-card"
import { EmployeeForm } from "./employee-form"
import { useEmployees } from "@/hooks/use-employees"
import type { EmployeeWithAvailability } from "@/types"
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 10

interface EmployeeListProps {
  locationId: string
  initialData: EmployeeWithAvailability[]
}

export function EmployeeList({ locationId, initialData }: EmployeeListProps) {
  const { employees, mutate } = useEmployees(locationId)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)

  const data = employees.length > 0 ? employees : initialData

  const filtered = data.filter((emp) => {
    const name = `${emp.firstName} ${emp.lastName}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Mitarbeiter suchen..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {paginated.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {search
              ? "Keine Mitarbeiter gefunden"
              : "Noch keine Mitarbeiter. Lege den ersten an!"}
          </div>
        ) : (
          paginated.map((emp) => <EmployeeCard key={emp.id} employee={emp} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Weiter
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* FAB */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setShowForm(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Create Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Neuer Mitarbeiter</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <EmployeeForm
              locationId={locationId}
              onSuccess={() => {
                setShowForm(false)
                mutate()
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
