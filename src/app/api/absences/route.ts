import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get("locationId")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!locationId || !from || !to) {
      return NextResponse.json(
        { error: "locationId, from und to sind erforderlich" },
        { status: 400 }
      )
    }

    const absences = await prisma.absence.findMany({
      where: {
        employee: { locationId, isActive: true },
        startDate: { lte: new Date(to + "T23:59:59.999Z") },
        endDate: { gte: new Date(from + "T00:00:00.000Z") },
      },
      include: { employee: true },
      orderBy: { startDate: "asc" },
    })

    return NextResponse.json({ data: absences })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Abwesenheiten" },
      { status: 500 }
    )
  }
}
