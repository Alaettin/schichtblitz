import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateShiftTemplateSchema } from "@/lib/validations/shift-template"

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const template = await prisma.shiftTemplate.findUnique({
      where: { id: params.id },
      include: { location: true },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Schichtvorlage nicht gefunden" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: template })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Schichtvorlage" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json()
    const parsed = updateShiftTemplateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const template = await prisma.shiftTemplate.update({
      where: { id: params.id },
      data: parsed.data,
      include: { location: true },
    })

    return NextResponse.json({ data: template })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Schichtvorlage" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await prisma.shiftTemplate.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Löschen der Schichtvorlage" },
      { status: 500 }
    )
  }
}
