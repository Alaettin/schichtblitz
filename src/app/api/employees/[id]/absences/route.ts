import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAbsenceSchema } from "@/lib/validations/absence"

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const absences = await prisma.absence.findMany({
      where: { employeeId: params.id },
      orderBy: { startDate: "desc" },
    })
    return NextResponse.json({ data: absences })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Abwesenheiten" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const body = await request.json()
    const parsed = createAbsenceSchema.safeParse({ ...body, employeeId: params.id })

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { type, startDate, endDate, note } = parsed.data
    const start = new Date(startDate + "T00:00:00.000Z")
    const end = new Date(endDate + "T00:00:00.000Z")

    // Check for overlapping absences
    const overlap = await prisma.absence.findFirst({
      where: {
        employeeId: params.id,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    })

    if (overlap) {
      return NextResponse.json(
        { error: "Überschneidung mit bestehender Abwesenheit" },
        { status: 400 }
      )
    }

    const absence = await prisma.absence.create({
      data: {
        employeeId: params.id,
        type: type as never,
        startDate: start,
        endDate: end,
        note: note || null,
      },
    })

    return NextResponse.json({ data: absence }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Abwesenheit" },
      { status: 500 }
    )
  }
}
