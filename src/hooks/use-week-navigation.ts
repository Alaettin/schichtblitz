import { useState, useCallback, useMemo } from "react"
import { startOfISOWeek, addWeeks, subWeeks, getISOWeek, format } from "date-fns"
import { de } from "date-fns/locale"

/** Convert local date to UTC midnight to match DB storage */
function toUTCMidnight(d: Date): Date {
  return new Date(format(d, "yyyy-MM-dd") + "T00:00:00.000Z")
}

export function useWeekNavigation() {
  const [weekStart, setWeekStart] = useState<Date>(() => toUTCMidnight(startOfISOWeek(new Date())))

  const goNext = useCallback(() => setWeekStart((d) => toUTCMidnight(addWeeks(d, 1))), [])
  const goPrev = useCallback(() => setWeekStart((d) => toUTCMidnight(subWeeks(d, 1))), [])
  const goToday = useCallback(() => setWeekStart(toUTCMidnight(startOfISOWeek(new Date()))), [])

  const weekNumber = useMemo(() => getISOWeek(weekStart), [weekStart])

  const weekLabel = useMemo(() => {
    const end = addWeeks(weekStart, 1)
    const from = format(weekStart, "dd.MM.", { locale: de })
    const to = format(new Date(end.getTime() - 86400000), "dd.MM.yyyy", { locale: de })
    return `KW ${weekNumber} · ${from} – ${to}`
  }, [weekStart, weekNumber])

  // ISO date string for API calls (YYYY-MM-DD)
  const weekStartStr = useMemo(() => format(weekStart, "yyyy-MM-dd"), [weekStart])

  const isCurrentWeek = useMemo(
    () => weekStartStr === format(startOfISOWeek(new Date()), "yyyy-MM-dd"),
    [weekStartStr]
  )

  return {
    weekStart,
    weekStartStr,
    weekNumber,
    weekLabel,
    isCurrentWeek,
    goNext,
    goPrev,
    goToday,
  }
}
