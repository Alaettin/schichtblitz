import { z } from "zod"

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich").max(50),
  lastName: z.string().min(1, "Nachname ist erforderlich").max(50),
  email: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  contractType: z.enum(["FULLTIME", "PARTTIME", "MINIJOB"], { message: "Vertragsart wählen" }),
  weeklyHours: z.number().min(0).max(48),
  hourlyRate: z.number().min(0).optional(),
  qualifications: z.array(z.enum(["KITCHEN", "SERVICE", "BAR"])).default([]),
  startDate: z.string().min(1, "Eintrittsdatum ist erforderlich"),
  locationId: z.string().min(1),
})

export const updateEmployeeSchema = createEmployeeSchema.partial().omit({ locationId: true })

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
