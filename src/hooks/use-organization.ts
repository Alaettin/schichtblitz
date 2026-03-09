import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((r) => r.data)

export function useOrganization() {
  const { data, error, isLoading, mutate } = useSWR("/api/organization", fetcher)

  return {
    organization: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useLocations() {
  const { data, error, isLoading, mutate } = useSWR("/api/locations", fetcher)

  return {
    locations: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
