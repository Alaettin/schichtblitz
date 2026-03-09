"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import type { Employee } from "@/types"

interface DeleteEmployeeDialogProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function DeleteEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onDeleted,
}: DeleteEmployeeDialogProps) {
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        toast({
          title: "Fehler",
          description: data.error || "Löschen fehlgeschlagen",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Mitarbeiter entfernt",
        description: `${employee.firstName} ${employee.lastName} wurde deaktiviert.`,
      })

      onDeleted()
    } catch {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mitarbeiter entfernen?</AlertDialogTitle>
          <AlertDialogDescription>
            {employee.firstName} {employee.lastName} wird deaktiviert und erscheint
            nicht mehr in der Team-Liste. Diese Aktion kann rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Entfernen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
