import useSWR from "swr"
import type { EmployeeWithAvailability } from "@/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((r) => r.data)

export function useEmployees(locationId?: string) {
  const url = locationId
    ? `/api/employees?locationId=${locationId}`
    : "/api/employees"

  const { data, error, isLoading, mutate } = useSWR<EmployeeWithAvailability[]>(url, fetcher)

  return {
    employees: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useEmployee(id: string) {
  const { data, error, isLoading, mutate } = useSWR<EmployeeWithAvailability>(
    id ? `/api/employees/${id}` : null,
    fetcher
  )

  return {
    employee: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}
