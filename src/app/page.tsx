import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Home() {
  const org = await prisma.organization.findFirst()

  if (!org) {
    redirect("/onboarding")
  }

  redirect("/team")
}
