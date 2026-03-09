import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { createAssignmentSchema } from "@/lib/validations/assignment"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get("locationId")
    const weekStart = searchParams.get("weekStart")

    if (!locationId || !weekStart) {
      return NextResponse.json(
        { error: "locationId und weekStart sind erforderlich" },
        { status: 400 }
      )
    }

    const assignments = await prisma.shiftAssignment.findMany({
      where: {
        weekStart: new Date(weekStart),
        shiftTemplate: { locationId, isActive: true },
      },
      include: {
        employee: true,
        shiftTemplate: true,
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ data: assignments })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Zuweisungen" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createAssignmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { shiftTemplateId, employeeId, dayOfWeek, weekStart, qualification } = parsed.data

    // Validate employee has the qualification
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee || !employee.isActive) {
      return NextResponse.json({ error: "Mitarbeiter nicht gefunden" }, { status: 404 })
    }
    if (!employee.qualifications.includes(qualification)) {
      return NextResponse.json(
        { error: `Mitarbeiter hat nicht die Qualifikation ${qualification}` },
        { status: 400 }
      )
    }

    // Validate shift template exists
    const template = await prisma.shiftTemplate.findUnique({ where: { id: shiftTemplateId } })
    if (!template || !template.isActive) {
      return NextResponse.json({ error: "Schichtvorlage nicht gefunden" }, { status: 404 })
    }

    // Check for overlapping shifts on the same day
    const existingAssignments = await prisma.shiftAssignment.findMany({
      where: {
        employeeId,
        dayOfWeek,
        weekStart: new Date(weekStart),
      },
      include: { shiftTemplate: true },
    })

    for (const existing of existingAssignments) {
      if (shiftsOverlap(template, existing.shiftTemplate)) {
        return NextResponse.json(
          { error: `Überlappung mit Schicht "${existing.shiftTemplate.name}"` },
          { status: 400 }
        )
      }
    }

    const assignment = await prisma.shiftAssignment.create({
      data: {
        shiftTemplateId,
        employeeId,
        dayOfWeek,
        weekStart: new Date(weekStart),
        qualification,
      },
      include: { employee: true, shiftTemplate: true },
    })

    revalidatePath("/dashboard")
    return NextResponse.json({ data: assignment }, { status: 201 })
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json(
        { error: "Mitarbeiter ist dieser Schicht bereits zugewiesen" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Zuweisung" },
      { status: 500 }
    )
  }
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function shiftsOverlap(
  a: { startTime: string; endTime: string },
  b: { startTime: string; endTime: string }
): boolean {
  const aStart = timeToMinutes(a.startTime)
  const aEnd = timeToMinutes(a.endTime)
  const bStart = timeToMinutes(b.startTime)
  const bEnd = timeToMinutes(b.endTime)

  // Handle overnight shifts
  if (aEnd <= aStart || bEnd <= bStart) {
    // Overnight: always overlaps with any shift for simplicity
    return true
  }

  return aStart < bEnd && bStart < aEnd
}
