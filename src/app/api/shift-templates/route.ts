import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createShiftTemplateSchema } from "@/lib/validations/shift-template"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get("locationId")

    const templates = await prisma.shiftTemplate.findMany({
      where: {
        ...(locationId ? { locationId } : {}),
        isActive: true,
      },
      include: { location: true },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json({ data: templates })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Schichtvorlagen" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createShiftTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const template = await prisma.shiftTemplate.create({
      data: parsed.data,
      include: { location: true },
    })

    return NextResponse.json({ data: template }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Schichtvorlage" },
      { status: 500 }
    )
  }
}
