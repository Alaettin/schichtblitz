import { z } from "zod"

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const availabilityEntrySchema = z.object({
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "PREFERRED"]),
  startTime: z.string().regex(timeRegex, { message: "Ungültiges Zeitformat (HH:MM)" }).nullable().optional(),
  endTime: z.string().regex(timeRegex, { message: "Ungültiges Zeitformat (HH:MM)" }).nullable().optional(),
})

export const upsertAvailabilitySchema = z
  .array(availabilityEntrySchema)
  .min(1, { message: "Mindestens ein Tag erforderlich" })
  .max(7, { message: "Maximal 7 Tage" })

export type AvailabilityEntry = z.infer<typeof availabilityEntrySchema>
