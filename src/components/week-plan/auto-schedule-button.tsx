"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Wand2, Loader2 } from "lucide-react"

interface AutoScheduleButtonProps {
  locationId: string
  weekStartStr: string
  onScheduled: () => void
}

export function AutoScheduleButton({
  locationId,
  weekStartStr,
  onScheduled,
}: AutoScheduleButtonProps) {
  const { toast } = useToast()
  const [showConfirm, setShowConfirm] = useState(false)
  const [clearExisting, setClearExisting] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSchedule = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/assignments/auto-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId, weekStart: weekStartStr, clearExisting }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: "Fehler", description: data.error, variant: "destructive" })
        return
      }

      const { created, warnings } = data.data
      onScheduled()

      toast({
        title: "Automatisch geplant",
        description: `${created} Schichten zugewiesen${warnings.length > 0 ? `, ${warnings.length} Warnungen` : ""}`,
      })
    } catch {
      toast({ title: "Fehler", description: "Ein Fehler ist aufgetreten", variant: "destructive" })
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4 mr-1" />
        )}
        Auto-Plan
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Automatische Planung</AlertDialogTitle>
            <AlertDialogDescription>
              Mitarbeiter werden basierend auf Verfügbarkeit, Qualifikation und Wochenstunden
              automatisch auf Schichten verteilt.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              className="rounded border-gray-300"
            />
            Bestehende Zuweisungen vorher löschen
          </label>

          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleSchedule} disabled={loading}>
              {loading ? "Plane..." : "Automatisch planen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
