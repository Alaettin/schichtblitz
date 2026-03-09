import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { upsertAvailabilitySchema } from "@/lib/validations/availability"

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const availabilities = await prisma.availability.findMany({
      where: { employeeId: params.id },
      orderBy: { dayOfWeek: "asc" },
    })
    return NextResponse.json({ data: availabilities })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Verfügbarkeiten" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json()
    const parsed = upsertAvailabilitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(
      parsed.data.map((entry) =>
        prisma.availability.upsert({
          where: {
            employeeId_dayOfWeek: {
              employeeId: params.id,
              dayOfWeek: entry.dayOfWeek,
            },
          },
          update: {
            status: entry.status,
            startTime: entry.startTime ?? null,
            endTime: entry.endTime ?? null,
          },
          create: {
            employeeId: params.id,
            dayOfWeek: entry.dayOfWeek,
            status: entry.status,
            startTime: entry.startTime ?? null,
            endTime: entry.endTime ?? null,
          },
        })
      )
    )

    return NextResponse.json({ data: result })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Speichern der Verfügbarkeiten" },
      { status: 500 }
    )
  }
}
