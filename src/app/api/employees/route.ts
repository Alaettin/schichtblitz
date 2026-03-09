import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createEmployeeSchema } from "@/lib/validations/employee"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get("locationId")

    const employees = await prisma.employee.findMany({
      where: {
        ...(locationId ? { locationId } : {}),
        isActive: true,
      },
      include: { location: true, availabilities: true },
      orderBy: { lastName: "asc" },
    })

    return NextResponse.json({ data: employees })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Mitarbeiter" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createEmployeeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { startDate, email, phone, ...rest } = parsed.data

    const employee = await prisma.employee.create({
      data: {
        ...rest,
        email: email || null,
        phone: phone || null,
        startDate: new Date(startDate),
      },
      include: { location: true },
    })

    return NextResponse.json({ data: employee }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Mitarbeiters" },
      { status: 500 }
    )
  }
}
