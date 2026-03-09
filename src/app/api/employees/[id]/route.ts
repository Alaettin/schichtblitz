import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateEmployeeSchema } from "@/lib/validations/employee"

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: { location: true },
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Mitarbeiter nicht gefunden" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: employee })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden des Mitarbeiters" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json()
    const parsed = updateEmployeeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { startDate, email, phone, ...rest } = parsed.data

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(email !== undefined ? { email: email || null } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(startDate ? { startDate: new Date(startDate) } : {}),
      },
      include: { location: true },
    })

    return NextResponse.json({ data: employee })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Mitarbeiters" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await prisma.employee.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Löschen des Mitarbeiters" },
      { status: 500 }
    )
  }
}
