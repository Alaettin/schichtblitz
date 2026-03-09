import { z } from "zod"

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const createAbsenceSchema = z
  .object({
    employeeId: z.string().min(1),
    type: z.enum(["URLAUB", "KRANKHEIT", "FREIWUNSCH", "SONSTIGES"], {
      message: "Abwesenheitsgrund wählen",
    }),
    startDate: z.string().regex(dateRegex, { message: "Format: YYYY-MM-DD" }),
    endDate: z.string().regex(dateRegex, { message: "Format: YYYY-MM-DD" }),
    note: z.string().max(200).optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "Enddatum muss nach Startdatum liegen",
    path: ["endDate"],
  })

export type CreateAbsenceInput = z.infer<typeof createAbsenceSchema>
