"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CONTRACT_TYPE_LABELS } from "@/types"

interface ContractTypeSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export function ContractTypeSelect({ value, onValueChange }: ContractTypeSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Vertragsart wählen" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CONTRACT_TYPE_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
