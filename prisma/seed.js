const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  // Check if already seeded
  const existing = await prisma.organization.findFirst()
  if (existing) {
    console.log("Datenbank bereits befüllt, Seed übersprungen")
    return
  }

  const org = await prisma.organization.create({
    data: { name: "Ristorante Bella" },
  })

  const location = await prisma.location.create({
    data: {
      name: "Hauptstandort",
      address: "Musterstraße 1, 10115 Berlin",
      organizationId: org.id,
    },
  })

  await prisma.shiftTemplate.createMany({
    data: [
      { name: "Frühschicht", startTime: "06:00", endTime: "14:00", staffing: { KITCHEN: 2, SERVICE: 1 }, locationId: location.id },
      { name: "Mittagsschicht", startTime: "10:00", endTime: "16:00", staffing: { KITCHEN: 2, SERVICE: 2 }, locationId: location.id },
      { name: "Spätschicht", startTime: "16:00", endTime: "23:00", staffing: { KITCHEN: 2, SERVICE: 1, BAR: 1 }, locationId: location.id },
    ],
  })

  const firstNames = [
    "Marco", "Anna", "Lisa", "Tom", "Julia",
    "Luca", "Sophie", "Niklas", "Emma", "Felix",
    "Mia", "Leon", "Hannah", "Paul", "Laura",
    "David", "Lena", "Tim", "Sarah", "Max",
    "Amelie", "Jan", "Katharina", "Moritz", "Elena",
    "Lukas", "Marie", "Finn", "Johanna", "Elias",
  ]

  const lastNames = [
    "Rossi", "Schmidt", "Weber", "Fischer", "Müller",
    "Becker", "Hoffmann", "Koch", "Richter", "Wolf",
    "Braun", "Schröder", "Neumann", "Schwarz", "Zimmermann",
    "Krüger", "Hartmann", "Lange", "Werner", "Lehmann",
    "Kaiser", "Fuchs", "Peters", "Scholz", "Möller",
    "Wagner", "Bauer", "Frank", "Vogel", "Berger",
  ]

  const contractTypes = ["FULLTIME", "PARTTIME", "MINIJOB"]
  const allQuals = ["KITCHEN", "SERVICE", "BAR"]

  const createdEmployees = []
  for (let i = 0; i < firstNames.length; i++) {
    const contract = contractTypes[i % 3]
    const weeklyHours = contract === "FULLTIME" ? 40 : contract === "PARTTIME" ? 20 + (i % 6) : 10
    const hourlyRate = 12.5 + (i % 8) * 0.5
    const quals = [allQuals[i % 3]]
    if (i % 3 === 0) quals.push(allQuals[(i + 1) % 3])

    createdEmployees.push(
      await prisma.employee.create({
        data: {
          firstName: firstNames[i],
          lastName: lastNames[i],
          email: `${firstNames[i].toLowerCase()}@bella.de`,
          phone: `+49 17${i % 5} ${1000000 + i * 111111}`,
          contractType: contract,
          weeklyHours,
          hourlyRate,
          qualifications: quals,
          startDate: new Date(`202${3 + Math.floor(i / 10)}-${String((i % 12) + 1).padStart(2, "0")}-01`),
          locationId: location.id,
        },
      })
    )
  }

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
  const A = "AVAILABLE"
  const U = "UNAVAILABLE"
  const P = "PREFERRED"

  const patterns = [
    [A, A, A, A, A, P, U],
    [A, A, A, A, A, A, U],
    [A, U, A, U, A, P, U],
    [U, U, U, A, A, A, P],
    [A, A, A, A, A, U, U],
    [P, A, A, A, P, U, U],
    [A, A, U, A, A, A, U],
    [U, A, A, A, A, A, U],
    [A, A, A, U, U, A, A],
    [A, U, A, A, U, P, P],
  ]

  for (let i = 0; i < createdEmployees.length; i++) {
    const emp = createdEmployees[i]
    const pattern = patterns[i % patterns.length]
    const hasTimeWindow = i % 5 === 4

    for (let d = 0; d < days.length; d++) {
      await prisma.availability.create({
        data: {
          employeeId: emp.id,
          dayOfWeek: days[d],
          status: pattern[d],
          ...(hasTimeWindow && pattern[d] !== U ? { startTime: "14:00", endTime: "22:00" } : {}),
        },
      })
    }
  }

  console.log(`Seed erfolgreich: ${org.name} mit ${createdEmployees.length} MA, 3 Schichtvorlagen, Verfügbarkeiten`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
