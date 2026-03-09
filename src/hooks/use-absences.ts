import useSWR from "swr"
import type { Absence, AbsenceWithEmployee } from "@/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => d.data ?? [])

/** Absences for a single employee (detail page). */
export function useAbsences(employeeId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Absence[]>(
    employeeId ? `/api/employees/${employeeId}/absences` : null,
    fetcher
  )
  return { absences: data ?? [], isLoading, isError: !!error, mutate }
}

/** Absences for a location + week range (week plan). */
export function useAbsencesForWeek(locationId: string, weekStartStr: string) {
  const from = weekStartStr
  // weekStart is Monday, end of week is Sunday = +6 days
  const to = new Date(new Date(weekStartStr + "T00:00:00.000Z").getTime() + 6 * 86400000)
    .toISOString()
    .split("T")[0]

  const { data, error, isLoading, mutate } = useSWR<AbsenceWithEmployee[]>(
    locationId && weekStartStr
      ? `/api/absences?locationId=${locationId}&from=${from}&to=${to}`
      : null,
    fetcher
  )
  return { absences: data ?? [], isLoading, isError: !!error, mutate }
}
