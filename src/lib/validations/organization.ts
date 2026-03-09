import { z } from "zod"

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben").max(100),
})

export const createLocationSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben").max(100),
  address: z.string().max(200).optional(),
  organizationId: z.string().min(1),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type CreateLocationInput = z.infer<typeof createLocationSchema>
