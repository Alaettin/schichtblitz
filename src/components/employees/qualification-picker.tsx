"use client"

import { Badge } from "@/components/ui/badge"
import { QUALIFICATION_LABELS, QUALIFICATION_COLORS } from "@/types"
import { cn } from "@/lib/utils"

interface QualificationPickerProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function QualificationPicker({ value, onChange }: QualificationPickerProps) {
  const toggle = (qual: string) => {
    if (value.includes(qual)) {
      onChange(value.filter((q) => q !== qual))
    } else {
      onChange([...value, qual])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(QUALIFICATION_LABELS).map(([key, label]) => {
        const isSelected = value.includes(key)
        return (
          <Badge
            key={key}
            variant="outline"
            className={cn(
              "cursor-pointer select-none transition-colors",
              isSelected
                ? QUALIFICATION_COLORS[key]
                : "opacity-50"
            )}
            onClick={() => toggle(key)}
          >
            {label}
          </Badge>
        )
      })}
    </div>
  )
}
