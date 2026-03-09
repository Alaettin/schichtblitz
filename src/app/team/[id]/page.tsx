import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
import { EmployeeDetail } from "@/components/employees/employee-detail"

interface Props {
  params: { id: string }
}

export default async function EmployeeDetailPage({ params }: Props) {
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: { location: true },
  })

  if (!employee) notFound()

  return (
    <div className="container py-4">
      <EmployeeDetail employee={employee} />
    </div>
  )
}
