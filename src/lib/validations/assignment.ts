import { z } from "zod"

const dayOfWeekEnum = z.enum([
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
])

const qualificationEnum = z.enum(["KITCHEN", "SERVICE", "BAR"])

const weekStartSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD")

export const createAssignmentSchema = z.object({
  shiftTemplateId: z.string().min(1),
  employeeId: z.string().min(1),
  dayOfWeek: dayOfWeekEnum,
  weekStart: weekStartSchema,
  qualification: qualificationEnum,
})

export const autoScheduleSchema = z.object({
  locationId: z.string().min(1),
  weekStart: weekStartSchema,
  clearExisting: z.boolean().optional().default(false),
})

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type AutoScheduleInput = z.infer<typeof autoScheduleSchema>
