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
import type { ShiftTemplate } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface DeleteShiftTemplateDialogProps {
  template: ShiftTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function DeleteShiftTemplateDialog({
  template,
  open,
  onOpenChange,
  onDeleted,
}: DeleteShiftTemplateDialogProps) {
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/shift-templates/${template.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        toast({
          title: "Fehler",
          description: data.error || "Vorlage konnte nicht gelöscht werden",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Vorlage gelöscht",
        description: `${template.name} wurde entfernt.`,
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
          <AlertDialogTitle>Schichtvorlage löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Die Vorlage &quot;{template.name}&quot; wird deaktiviert. Diese Aktion kann
            rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
