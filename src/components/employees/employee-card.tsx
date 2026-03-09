"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
  QUALIFICATION_LABELS,
  QUALIFICATION_COLORS,
} from "@/types"
import type { EmployeeWithAvailability } from "@/types"
import { ChevronRight } from "lucide-react"
import { AvailabilityBadge } from "./availability-badge"

interface EmployeeCardProps {
  employee: EmployeeWithAvailability
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Link href={`/team/${employee.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {employee.firstName[0]}
            {employee.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">
                {employee.firstName} {employee.lastName}
              </span>
              <Badge
                variant="secondary"
                className={CONTRACT_TYPE_COLORS[employee.contractType]}
              >
                {CONTRACT_TYPE_LABELS[employee.contractType]}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {employee.qualifications.map((qual) => (
                <Badge
                  key={qual}
                  variant="outline"
                  className={`text-xs ${QUALIFICATION_COLORS[qual]}`}
                >
                  {QUALIFICATION_LABELS[qual]}
                </Badge>
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                {employee.weeklyHours}h/Woche
              </span>
            </div>
            <div className="mt-1">
              <AvailabilityBadge availabilities={employee.availabilities ?? []} />
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  )
}
