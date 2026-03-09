import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { WeekPlanContainer } from "@/components/week-plan/week-plan-container"

export const dynamic = "force-dynamic"

export default async function WochenplanPage() {
  const org = await prisma.organization.findFirst({
    include: { locations: true },
  })

  if (!org) redirect("/onboarding")

  const location = org.locations[0]
  if (!location) redirect("/onboarding")

  const templates = await prisma.shiftTemplate.findMany({
    where: { locationId: location.id, isActive: true },
    orderBy: { startTime: "asc" },
  })

  return (
    <div className="container py-4">
      <PageHeader
        title="Wochenplan"
        description="Schichtplanung im Überblick"
      />
      <WeekPlanContainer locationId={location.id} initialTemplates={templates} />
    </div>
  )
}
