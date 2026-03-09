import { prisma } from "@/lib/prisma"
import type { Employee, Availability, Absence, ShiftTemplate } from "@prisma/client"
import { getStaffingForDay, getDayDate, isAbsentOnDay } from "@/types"

interface EmployeeWithAvail extends Employee {
  availabilities: Availability[]
  absences: Absence[]
}

export interface AutoScheduleResult {
  created: number
  warnings: string[]
}

// ─── Helpers ───

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function shiftDurationHours(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const minutes = end > start ? end - start : 1440 - start + end
  return minutes / 60
}

export function shiftsOverlap(
  a: { startTime: string; endTime: string },
  b: { startTime: string; endTime: string }
): boolean {
  const aStart = timeToMinutes(a.startTime)
  const aEnd = timeToMinutes(a.endTime)
  const bStart = timeToMinutes(b.startTime)
  const bEnd = timeToMinutes(b.endTime)

  if (aEnd <= aStart || bEnd <= bStart) return true // overnight → overlap
  return aStart < bEnd && bStart < aEnd
}

function fitsInWindow(
  shift: { startTime: string; endTime: string },
  availStartTime: string | null,
  availEndTime: string | null
): boolean {
  if (!availStartTime || !availEndTime) return true
  const shiftStart = timeToMinutes(shift.startTime)
  const shiftEnd = timeToMinutes(shift.endTime)
  const windowStart = timeToMinutes(availStartTime)
  const windowEnd = timeToMinutes(availEndTime)
  return shiftStart >= windowStart && shiftEnd <= windowEnd
}

// ─── Main Algorithm (Round-Robin) ───

export async function autoSchedule(
  locationId: string,
  weekStart: Date,
  clearExisting: boolean
): Promise<AutoScheduleResult> {
  if (clearExisting) {
    await prisma.shiftAssignment.deleteMany({
      where: { weekStart, shiftTemplate: { locationId } },
    })
  }

  const templates = await prisma.shiftTemplate.findMany({
    where: { locationId, isActive: true },
    orderBy: { startTime: "asc" },
  })

  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000)

  const employees = await prisma.employee.findMany({
    where: { locationId, isActive: true },
    include: {
      availabilities: true,
      absences: {
        where: {
          startDate: { lte: weekEnd },
          endDate: { gte: weekStart },
        },
      },
    },
  }) as EmployeeWithAvail[]

  const existingAssignments = await prisma.shiftAssignment.findMany({
    where: { weekStart, shiftTemplate: { locationId } },
    include: { shiftTemplate: true },
  })

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

  // ─── Employee state tracking ───
  const empState = new Map<string, {
    remainingHours: number
    assignmentCount: number
    dayShifts: Map<string, { startTime: string; endTime: string }[]>
  }>()

  for (const emp of employees) {
    const assignedHours = existingAssignments
      .filter((a) => a.employeeId === emp.id)
      .reduce((sum, a) => sum + shiftDurationHours(a.shiftTemplate.startTime, a.shiftTemplate.endTime), 0)

    const dayShifts = new Map<string, { startTime: string; endTime: string }[]>()
    for (const a of existingAssignments.filter((ea) => ea.employeeId === emp.id)) {
      const existing = dayShifts.get(a.dayOfWeek) ?? []
      existing.push({ startTime: a.shiftTemplate.startTime, endTime: a.shiftTemplate.endTime })
      dayShifts.set(a.dayOfWeek, existing)
    }

    empState.set(emp.id, {
      remainingHours: emp.weeklyHours - assignedHours,
      assignmentCount: existingAssignments.filter((a) => a.employeeId === emp.id).length,
      dayShifts,
    })
  }

  // ─── Build all slots ───
  interface Slot {
    templateId: string
    day: string
    qualification: string
    template: ShiftTemplate
  }

  const allSlots: Slot[] = []
  for (const template of templates) {
    for (const day of days) {
      const dayStaffing = getStaffingForDay(template.staffing, day)
      for (const [qual, required] of Object.entries(dayStaffing)) {
        if (!required || required <= 0) continue
        const filled = existingAssignments.filter(
          (a) => a.shiftTemplateId === template.id && a.dayOfWeek === day && a.qualification === qual
        ).length
        for (let i = filled; i < required; i++) {
          allSlots.push({ templateId: template.id, day, qualification: qual, template })
        }
      }
    }
  }

  // ─── Round-Robin: Process day by day, spread load evenly ───
  // Sort slots: by day first, then hardest-to-fill per day
  const dayOrder = new Map(days.map((d, i) => [d, i]))

  // Pre-compute eligible count per slot
  const eligibleForSlot = (slot: Slot): number => {
    return employees.filter((emp) => canAssign(emp, slot)).length
  }

  allSlots.sort((a, b) => {
    const dayDiff = (dayOrder.get(a.day) ?? 0) - (dayOrder.get(b.day) ?? 0)
    if (dayDiff !== 0) return dayDiff
    // Within same day: hardest first
    return eligibleForSlot(a) - eligibleForSlot(b)
  })

  // ─── Greedy Assignment ───
  const newAssignments: { shiftTemplateId: string; employeeId: string; dayOfWeek: string; weekStart: Date; qualification: string }[] = []
  const warnings: string[] = []

  for (const slot of allSlots) {
    const candidates: { employeeId: string; score: number; assignmentCount: number; remainingHours: number }[] = []

    for (const emp of employees) {
      if (!canAssign(emp, slot)) continue

      const avail = emp.availabilities.find((a) => a.dayOfWeek === slot.day)
      const prefScore = avail?.status === "PREFERRED" ? 2 : 1
      const state = empState.get(emp.id)!

      candidates.push({
        employeeId: emp.id,
        score: prefScore,
        assignmentCount: state.assignmentCount,
        remainingHours: state.remainingHours,
      })
    }

    // Sort: PREFERRED first, then fewest assignments, then MOST remaining hours
    // (we want the MA with the most flexibility for the hardest slots,
    //  but since we sort by day and hardest-first within day, this works well)
    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (a.assignmentCount !== b.assignmentCount) return a.assignmentCount - b.assignmentCount
      return b.remainingHours - a.remainingHours
    })

    if (candidates.length === 0) {
      const dayLabel = slot.day.charAt(0) + slot.day.slice(1).toLowerCase()
      warnings.push(`${slot.template.name} (${dayLabel}): Kein MA für ${slot.qualification} verfügbar`)
      continue
    }

    const best = candidates[0]
    const duration = shiftDurationHours(slot.template.startTime, slot.template.endTime)

    newAssignments.push({
      shiftTemplateId: slot.templateId,
      employeeId: best.employeeId,
      dayOfWeek: slot.day,
      weekStart,
      qualification: slot.qualification,
    })

    // Update state
    const state = empState.get(best.employeeId)!
    state.remainingHours -= duration
    state.assignmentCount += 1
    const dayShifts = state.dayShifts.get(slot.day) ?? []
    dayShifts.push({ startTime: slot.template.startTime, endTime: slot.template.endTime })
    state.dayShifts.set(slot.day, dayShifts)
  }

  // ─── Bulk create ───
  if (newAssignments.length > 0) {
    await prisma.$transaction(
      newAssignments.map((a) =>
        prisma.shiftAssignment.create({
          data: {
            shiftTemplateId: a.shiftTemplateId,
            employeeId: a.employeeId,
            dayOfWeek: a.dayOfWeek as never,
            weekStart: a.weekStart,
            qualification: a.qualification as never,
          },
        })
      )
    )
  }

  return { created: newAssignments.length, warnings }

  // ─── Eligibility helper (closure over empState) ───
  function canAssign(emp: EmployeeWithAvail, slot: Slot): boolean {
    if (!emp.qualifications.includes(slot.qualification as never)) return false

    // Check absence for this specific day
    const dayDate = getDayDate(weekStart, slot.day)
    if (isAbsentOnDay(emp.absences, dayDate)) return false

    const avail = emp.availabilities.find((a) => a.dayOfWeek === slot.day)
    if (!avail || avail.status === "UNAVAILABLE") return false

    if (!fitsInWindow(slot.template, avail.startTime, avail.endTime)) return false

    const state = empState.get(emp.id)
    if (!state) return false

    const duration = shiftDurationHours(slot.template.startTime, slot.template.endTime)
    if (state.remainingHours < duration) return false

    // Max one shift per day per employee
    const dayShifts = state.dayShifts.get(slot.day) ?? []
    if (dayShifts.length > 0) return false

    return true
  }
}
