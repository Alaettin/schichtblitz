import useSWR from "swr"
import type { Availability } from "@/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((r) => r.data)

export function useAvailability(employeeId: string) {
  const { data, error, isLoading, mutate } = useSWR<Availability[]>(
    employeeId ? `/api/employees/${employeeId}/availability` : null,
    fetcher
  )

  return {
    availabilities: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
