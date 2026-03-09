import type { Organization, Location, Employee, Availability, ShiftTemplate, ShiftAssignment, Absence } from "@prisma/client"

// Re-export Prisma types
export type { Organization, Location, Employee, Availability, ShiftTemplate, ShiftAssignment, Absence }

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

// Employee with location included
export interface EmployeeWithLocation extends Employee {
  location: Location
}

// Employee with location + availabilities
export interface EmployeeWithAvailability extends Employee {
  location: Location
  availabilities: Availability[]
}

// Location with employee count
export interface LocationWithCount extends Location {
  _count: { employees: number }
}

// ShiftTemplate with location
export interface ShiftTemplateWithLocation extends ShiftTemplate {
  location: Location
}

// German labels for enums
export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  FULLTIME: "Vollzeit",
  PARTTIME: "Teilzeit",
  MINIJOB: "Minijob",
}

export const QUALIFICATION_LABELS: Record<string, string> = {
  KITCHEN: "Küche",
  SERVICE: "Service",
  BAR: "Bar",
}

export const DAY_OF_WEEK_LABELS: Record<string, string> = {
  MONDAY: "Montag",
  TUESDAY: "Dienstag",
  WEDNESDAY: "Mittwoch",
  THURSDAY: "Donnerstag",
  FRIDAY: "Freitag",
  SATURDAY: "Samstag",
  SUNDAY: "Sonntag",
}

export const DAY_OF_WEEK_SHORT: Record<string, string> = {
  MONDAY: "Mo",
  TUESDAY: "Di",
  WEDNESDAY: "Mi",
  THURSDAY: "Do",
  FRIDAY: "Fr",
  SATURDAY: "Sa",
  SUNDAY: "So",
}

export const DAYS_ORDERED = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const

export const AVAILABILITY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Verfügbar",
  UNAVAILABLE: "Nicht verfügbar",
  PREFERRED: "Bevorzugt",
}

export const AVAILABILITY_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  UNAVAILABLE: "bg-red-100 text-red-800",
  PREFERRED: "bg-blue-100 text-blue-800",
}

export const AVAILABILITY_DOT_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-500",
  UNAVAILABLE: "bg-red-400",
  PREFERRED: "bg-blue-500",
}

export const CONTRACT_TYPE_COLORS: Record<string, string> = {
  FULLTIME: "bg-green-100 text-green-800",
  PARTTIME: "bg-blue-100 text-blue-800",
  MINIJOB: "bg-orange-100 text-orange-800",
}

export const QUALIFICATION_COLORS: Record<string, string> = {
  KITCHEN: "bg-red-100 text-red-700",
  SERVICE: "bg-purple-100 text-purple-700",
  BAR: "bg-amber-100 text-amber-700",
}

// Absence labels & colors
export const ABSENCE_TYPE_LABELS: Record<string, string> = {
  URLAUB: "Urlaub",
  KRANKHEIT: "Krankheit",
  FREIWUNSCH: "Freiwunsch",
  SONSTIGES: "Sonstiges",
}

export const ABSENCE_TYPE_COLORS: Record<string, string> = {
  URLAUB: "bg-blue-100 text-blue-700",
  KRANKHEIT: "bg-red-100 text-red-700",
  FREIWUNSCH: "bg-purple-100 text-purple-700",
  SONSTIGES: "bg-gray-100 text-gray-700",
}

// Assignment types
export interface AssignmentWithDetails extends ShiftAssignment {
  employee: Employee
  shiftTemplate: ShiftTemplate
}

export interface CellData {
  templateId: string
  day: string
  assignments: AssignmentWithDetails[]
  required: StaffingMap
  totalRequired: number
  totalFilled: number
  status: "full" | "partial" | "empty"
}

export interface AbsenceWithEmployee extends Absence {
  employee: Employee
}

export interface ScheduleWarning {
  type: "understaffed" | "overscheduled" | "overlap" | "absent-assigned"
  message: string
  employeeId?: string
  templateId?: string
  day?: string
}

// Staffing types
export type StaffingMap = Partial<Record<string, number>>
export type WeeklyStaffingMap = Record<string, StaffingMap>

export const QUALIFICATIONS_ORDERED = ["KITCHEN", "SERVICE", "BAR"] as const

const DAY_KEYS = new Set(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])

/** Extracts staffing for a specific day. Supports both old (flat) and new (per-day) format. */
export function getStaffingForDay(staffing: unknown, day: string): StaffingMap {
  if (!staffing || typeof staffing !== "object") return {}
  const obj = staffing as Record<string, unknown>
  // New format: keys are day names
  const firstKey = Object.keys(obj)[0]
  if (firstKey && DAY_KEYS.has(firstKey)) {
    const dayVal = obj[day]
    if (!dayVal || typeof dayVal !== "object") return {}
    return dayVal as StaffingMap
  }
  // Old format: flat StaffingMap applies to all days
  return obj as StaffingMap
}

export function totalStaffing(staffing: StaffingMap): number {
  return Object.values(staffing).reduce<number>((sum, n) => sum + (n ?? 0), 0)
}

// ─── Absence helpers ───

const DAY_OFFSETS: Record<string, number> = {
  MONDAY: 0, TUESDAY: 1, WEDNESDAY: 2, THURSDAY: 3,
  FRIDAY: 4, SATURDAY: 5, SUNDAY: 6,
}

/** Get the actual Date for a day-of-week within a given ISO week (weekStart = Monday). */
export function getDayDate(weekStart: string | Date, dayOfWeek: string): Date {
  const base = typeof weekStart === "string" ? new Date(weekStart + "T00:00:00.000Z") : new Date(weekStart)
  const d = new Date(base.getTime() + (DAY_OFFSETS[dayOfWeek] ?? 0) * 86400000)
  return d
}

/** Check if any absence covers the given date. */
export function isAbsentOnDay(
  absences: { startDate: Date | string; endDate: Date | string }[],
  dayDate: Date
): boolean {
  const day = dayDate.getTime()
  return absences.some((a) => {
    const start = new Date(a.startDate).setUTCHours(0, 0, 0, 0)
    const end = new Date(a.endDate).setUTCHours(23, 59, 59, 999)
    return day >= start && day <= end
  })
}
