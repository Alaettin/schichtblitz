import useSWR from "swr"
import type { AssignmentWithDetails } from "@/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((r) => r.data)

export function useAssignments(locationId: string, weekStart: string) {
  const url =
    locationId && weekStart
      ? `/api/assignments?locationId=${locationId}&weekStart=${weekStart}`
      : null

  const { data, error, isLoading, mutate } = useSWR<AssignmentWithDetails[]>(url, fetcher)

  return {
    assignments: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
