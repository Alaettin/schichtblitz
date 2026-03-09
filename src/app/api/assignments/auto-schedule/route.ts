import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { autoScheduleSchema } from "@/lib/validations/assignment"
import { autoSchedule } from "@/lib/auto-schedule"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = autoScheduleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { locationId, weekStart, clearExisting } = parsed.data
    const result = await autoSchedule(locationId, new Date(weekStart), clearExisting)

    revalidatePath("/dashboard")
    return NextResponse.json({ data: result })
  } catch (e) {
    console.error("Auto-schedule error:", e)
    return NextResponse.json(
      { error: "Fehler bei der automatischen Planung" },
      { status: 500 }
    )
  }
}
