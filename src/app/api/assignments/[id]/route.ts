import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

interface Params {
  params: { id: string }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await prisma.shiftAssignment.delete({
      where: { id: params.id },
    })
    revalidatePath("/dashboard")
    return NextResponse.json({ data: { id: params.id } })
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Löschen der Zuweisung" },
      { status: 500 }
    )
  }
}
