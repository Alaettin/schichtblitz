import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { PageHeader } from "@/components/layout/page-header"
import { EmployeeList } from "@/components/employees/employee-list"

export default async function TeamPage() {
  const org = await prisma.organization.findFirst({
    include: { locations: true },
  })

  if (!org) redirect("/onboarding")

  const location = org.locations[0]
  if (!location) redirect("/onboarding")

  const employees = await prisma.employee.findMany({
    where: { locationId: location.id, isActive: true },
    include: { location: true, availabilities: true },
    orderBy: { lastName: "asc" },
  })

  return (
    <div className="container py-4">
      <PageHeader
        title="Team"
        description={`${employees.length} Mitarbeiter · ${location.name}`}
      />
      <EmployeeList locationId={location.id} initialData={employees} />
    </div>
  )
}
