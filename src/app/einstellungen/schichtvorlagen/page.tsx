import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { ShiftTemplateList } from "@/components/shift-templates/shift-template-list"

export const dynamic = "force-dynamic"

export default async function SchichtvorlagenPage() {
  const org = await prisma.organization.findFirst({
    include: { locations: true },
  })

  if (!org) redirect("/onboarding")

  const location = org.locations[0]
  if (!location) redirect("/onboarding")

  return (
    <div className="container py-4">
      <PageHeader
        title="Schichtvorlagen"
        description="Vorlagen für wiederkehrende Schichten verwalten"
      />
      <ShiftTemplateList locationId={location.id} />
    </div>
  )
}
