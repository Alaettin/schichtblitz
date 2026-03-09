"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ShiftTemplateCard } from "./shift-template-card"
import { ShiftTemplateForm } from "./shift-template-form"
import { DeleteShiftTemplateDialog } from "./delete-shift-template-dialog"
import { useShiftTemplates } from "@/hooks/use-shift-templates"
import type { ShiftTemplate } from "@/types"
import { Plus } from "lucide-react"

interface ShiftTemplateListProps {
  locationId: string
}

export function ShiftTemplateList({ locationId }: ShiftTemplateListProps) {
  const { templates, mutate } = useShiftTemplates(locationId)
  const [showForm, setShowForm] = useState(false)
  const [editTemplate, setEditTemplate] = useState<ShiftTemplate | null>(null)
  const [deleteTemplate, setDeleteTemplate] = useState<ShiftTemplate | null>(null)

  return (
    <div className="space-y-4">
      {templates.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Noch keine Schichtvorlagen. Lege die erste an!
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="group relative">
              <ShiftTemplateCard
                template={t}
                onClick={() => setEditTemplate(t)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTemplate(t)
                }}
              >
                Löschen
              </Button>
            </div>
          ))}
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
            <SheetTitle>Neue Schichtvorlage</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <ShiftTemplateForm
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

      {/* Edit Sheet */}
      <Sheet open={!!editTemplate} onOpenChange={(open) => !open && setEditTemplate(null)}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Schichtvorlage bearbeiten</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {editTemplate && (
              <ShiftTemplateForm
                template={editTemplate}
                locationId={locationId}
                onSuccess={() => {
                  setEditTemplate(null)
                  mutate()
                }}
                onCancel={() => setEditTemplate(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      {deleteTemplate && (
        <DeleteShiftTemplateDialog
          template={deleteTemplate}
          open={!!deleteTemplate}
          onOpenChange={(open) => !open && setDeleteTemplate(null)}
          onDeleted={() => {
            setDeleteTemplate(null)
            mutate()
          }}
        />
      )}
    </div>
  )
}
