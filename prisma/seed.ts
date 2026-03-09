import { PrismaClient, ContractType, Qualification, DayOfWeek, AvailabilityStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Betrieb anlegen
  const org = await prisma.organization.create({
    data: {
      name: "Ristorante Bella",
    },
  })

  // Standort anlegen
  const location = await prisma.location.create({
    data: {
      name: "Hauptstandort",
      address: "Musterstraße 1, 10115 Berlin",
      organizationId: org.id,
    },
  })

  // Schichtvorlagen
  await prisma.shiftTemplate.createMany({
    data: [
      {
        name: "Frühschicht",
        startTime: "06:00",
        endTime: "14:00",
        staffing: { KITCHEN: 2, SERVICE: 1 },
        locationId: location.id,
      },
      {
        name: "Mittagsschicht",
        startTime: "10:00",
        endTime: "16:00",
        staffing: { KITCHEN: 2, SERVICE: 2 },
        locationId: location.id,
      },
      {
        name: "Spätschicht",
        startTime: "16:00",
        endTime: "23:00",
        staffing: { KITCHEN: 2, SERVICE: 1, BAR: 1 },
        locationId: location.id,
      },
    ],
  })

  // 30 Demo-Mitarbeiter
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

  const contractTypes = [ContractType.FULLTIME, ContractType.PARTTIME, ContractType.MINIJOB]
  const allQuals = [Qualification.KITCHEN, Qualification.SERVICE, Qualification.BAR]

  const employeeData = firstNames.map((firstName, i) => {
    const contract = contractTypes[i % 3]
    const weeklyHours = contract === ContractType.FULLTIME ? 40 : contract === ContractType.PARTTIME ? 20 + (i % 6) : 10
    const hourlyRate = 12.5 + (i % 8) * 0.5

    // 1-2 Qualifikationen pro MA
    const quals = [allQuals[i % 3]]
    if (i % 3 === 0) quals.push(allQuals[(i + 1) % 3])

    return {
      firstName,
      lastName: lastNames[i],
      email: `${firstName.toLowerCase()}@bella.de`,
      phone: `+49 17${i % 5} ${1000000 + i * 111111}`,
      contractType: contract,
      weeklyHours,
      hourlyRate,
      qualifications: quals,
      startDate: new Date(`202${3 + Math.floor(i / 10)}-${String((i % 12) + 1).padStart(2, "0")}-01`),
      locationId: location.id,
    }
  })

  const createdEmployees = []
  for (const emp of employeeData) {
    createdEmployees.push(await prisma.employee.create({ data: emp }))
  }

  // Verfügbarkeiten — realistische Muster
  const days = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY]

  const A = AvailabilityStatus.AVAILABLE
  const U = AvailabilityStatus.UNAVAILABLE
  const P = AvailabilityStatus.PREFERRED

  const patterns: AvailabilityStatus[][] = [
    [A, A, A, A, A, P, U], // Vollzeit Mo-Fr, Sa bevorzugt
    [A, A, A, A, A, A, U], // Vollzeit Mo-Sa
    [A, U, A, U, A, P, U], // Teilzeit Mo/Mi/Fr
    [U, U, U, A, A, A, P], // Wochenende Do-So
    [A, A, A, A, A, U, U], // Mo-Fr
    [P, A, A, A, P, U, U], // Mo/Fr bevorzugt
    [A, A, U, A, A, A, U], // Mi frei
    [U, A, A, A, A, A, U], // Di-Sa
    [A, A, A, U, U, A, A], // Do/Fr frei, Wochenende
    [A, U, A, A, U, P, P], // Wechselnd
  ]

  for (let i = 0; i < createdEmployees.length; i++) {
    const emp = createdEmployees[i]
    const pattern = patterns[i % patterns.length]
    const hasTimeWindow = i % 5 === 4 // Jeder 5. MA hat Zeitfenster

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
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
