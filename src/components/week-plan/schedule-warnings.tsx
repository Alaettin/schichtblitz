"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { ScheduleWarning } from "@/types"
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"

interface ScheduleWarningsProps {
  warnings: ScheduleWarning[]
}

export function ScheduleWarnings({ warnings }: ScheduleWarningsProps) {
  const [expanded, setExpanded] = useState(false)

  const understaffed = warnings.filter((w) => w.type === "understaffed")
  const overscheduled = warnings.filter((w) => w.type === "overscheduled")

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-sm"
      >
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">{warnings.length} Warnung{warnings.length !== 1 ? "en" : ""}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-amber-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-600" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          {understaffed.length > 0 && (
            <div>
              <span className="text-xs font-medium text-red-700">Unterbesetzt:</span>
              {understaffed.map((w, i) => (
                <p key={i} className="text-xs text-red-600 ml-2">{w.message}</p>
              ))}
            </div>
          )}
          {overscheduled.length > 0 && (
            <div>
              <span className="text-xs font-medium text-amber-700">Überstunden:</span>
              {overscheduled.map((w, i) => (
                <p key={i} className="text-xs text-amber-600 ml-2">{w.message}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
