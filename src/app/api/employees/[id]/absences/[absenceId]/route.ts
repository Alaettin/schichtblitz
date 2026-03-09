import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface Params {
  params: { id: string; absenceId: string }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    // Verify absence belongs to employee
    const absence = await prisma.absence.findFirst({
      where: { id: params.absenceId, employeeId: params.id },
    })

    if (!absence) {
      return NextResponse.json(
        { error: "Abwesenheit nicht gefunden" },
        { status: 404 }
      )
    }

    await prisma.absence.delete({ where: { id: params.absenceId } })
    return NextResponse.json({ data: { id: params.absenceId } })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Löschen der Abwesenheit" },
      { status: 500 }
    )
  }
}
