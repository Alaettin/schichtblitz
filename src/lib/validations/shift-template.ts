import { z } from "zod"

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const qualStaffingSchema = z.record(z.string(), z.number().int().min(0))

// Per-day staffing: { MONDAY: { KITCHEN: 2 }, SUNDAY: {}, ... }
const weeklyStaffingSchema = z
  .record(z.string(), qualStaffingSchema)
  .refine(
    (obj) => {
      const dayKeys = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
      const keys = Object.keys(obj)
      return keys.length > 0 && keys.every((k) => dayKeys.includes(k))
    },
    { message: "Ungültige Wochentage" }
  )
  .refine(
    (obj) => Object.values(obj).some((day) => Object.values(day).some((v) => v > 0)),
    { message: "Mindestens ein Tag mit > 0 Mitarbeitern" }
  )

export const createShiftTemplateSchema = z.object({
  name: z.string().min(1, { message: "Name ist erforderlich" }).max(50),
  startTime: z.string().regex(timeRegex, { message: "Ungültige Startzeit (HH:MM)" }),
  endTime: z.string().regex(timeRegex, { message: "Ungültige Endzeit (HH:MM)" }),
  staffing: weeklyStaffingSchema,
  locationId: z.string().min(1),
})

export const updateShiftTemplateSchema = createShiftTemplateSchema.partial().omit({ locationId: true })

export type CreateShiftTemplateInput = z.infer<typeof createShiftTemplateSchema>
export type UpdateShiftTemplateInput = z.infer<typeof updateShiftTemplateSchema>
