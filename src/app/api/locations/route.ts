import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createLocationSchema } from "@/lib/validations/organization"

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ data: locations })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Standorte" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createLocationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const location = await prisma.location.create({
      data: parsed.data,
    })

    return NextResponse.json({ data: location }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Standorts" },
      { status: 500 }
    )
  }
}
