import useSWR from "swr"
import type { ShiftTemplateWithLocation } from "@/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((r) => r.data)

export function useShiftTemplates(locationId?: string) {
  const url = locationId
    ? `/api/shift-templates?locationId=${locationId}`
    : "/api/shift-templates"

  const { data, error, isLoading, mutate } = useSWR<ShiftTemplateWithLocation[]>(url, fetcher)

  return {
    templates: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
