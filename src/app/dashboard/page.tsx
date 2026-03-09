import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { startOfISOWeek, getISOWeek, addWeeks, format } from "date-fns"
import { de } from "date-fns/locale"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react"
import { getStaffingForDay, totalStaffing } from "@/types"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const org = await prisma.organization.findFirst({
    include: { locations: true },
  })

  if (!org) redirect("/onboarding")

  const location = org.locations[0]
  if (!location) redirect("/onboarding")

  const now = new Date()
  const localWeekStart = startOfISOWeek(now)
  // Convert to UTC midnight to match how API stores weekStart
  const weekStart = new Date(format(localWeekStart, "yyyy-MM-dd") + "T00:00:00.000Z")
  const weekEnd = addWeeks(weekStart, 1)
  const weekNumber = getISOWeek(weekStart)
  const weekLabel = `KW ${weekNumber} · ${format(weekStart, "dd.MM.", { locale: de })} – ${format(new Date(weekEnd.getTime() - 86400000), "dd.MM.", { locale: de })}`

  // Fetch data
  const [templates, assignments, employeeCount] = await Promise.all([
    prisma.shiftTemplate.findMany({
      where: { locationId: location.id, isActive: true },
    }),
    prisma.shiftAssignment.findMany({
      where: {
        weekStart,
        shiftTemplate: { locationId: location.id, isActive: true },
      },
    }),
    prisma.employee.count({
      where: { locationId: location.id, isActive: true },
    }),
  ])

  // Calculate stats
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
  let totalSlots = 0
  let filledSlots = 0
  let understaffedCells = 0

  for (const template of templates) {
    for (const day of days) {
      const dayStaffing = getStaffingForDay(template.staffing, day)
      const total = totalStaffing(dayStaffing)
      if (total === 0) continue
      totalSlots += total
      const filled = assignments.filter(
        (a) => a.shiftTemplateId === template.id && a.dayOfWeek === day
      ).length
      filledSlots += filled
      if (filled < total) understaffedCells++
    }
  }

  const fillPercentage = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0

  return (
    <div className="container py-4">
      <PageHeader title="Dashboard" description={`${org.name} · ${location.name}`} />

      <div className="space-y-4">
        {/* Week overview card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {weekLabel}
              </CardTitle>
              <Link href="/wochenplan">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  Zum Wochenplan
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Besetzung</span>
                  <span className="font-medium">{filledSlots}/{totalSlots} Schichten</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      fillPercentage === 100
                        ? "bg-green-500"
                        : fillPercentage > 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-lg font-bold">{fillPercentage}%</div>
                  <div className="text-xs text-muted-foreground">Besetzt</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-lg font-bold">{templates.length}</div>
                  <div className="text-xs text-muted-foreground">Schichten</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-lg font-bold">{employeeCount}</div>
                  <div className="text-xs text-muted-foreground">Mitarbeiter</div>
                </div>
              </div>

              {/* Warning or success */}
              {understaffedCells > 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {understaffedCells} unterbesetzte Schicht{understaffedCells !== 1 ? "en" : ""}
                </div>
              ) : totalSlots > 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2 text-sm text-green-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Alle Schichten besetzt
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/team" className="block">
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{employeeCount}</div>
                  <div className="text-xs text-muted-foreground">Team</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/einstellungen/schichtvorlagen" className="block">
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{templates.length}</div>
                  <div className="text-xs text-muted-foreground">Vorlagen</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
