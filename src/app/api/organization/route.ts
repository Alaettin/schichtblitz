import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createOrganizationSchema } from "@/lib/validations/organization"

export async function GET() {
  try {
    const org = await prisma.organization.findFirst({
      include: {
        locations: {
          include: {
            _count: { select: { employees: true } },
          },
        },
      },
    })
    return NextResponse.json({ data: org })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Organisation" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createOrganizationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Only allow one organization (MVP constraint)
    const existing = await prisma.organization.findFirst()
    if (existing) {
      return NextResponse.json(
        { error: "Organisation existiert bereits" },
        { status: 409 }
      )
    }

    const org = await prisma.organization.create({
      data: { name: parsed.data.name },
    })

    return NextResponse.json({ data: org }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Organisation" },
      { status: 500 }
    )
  }
}
