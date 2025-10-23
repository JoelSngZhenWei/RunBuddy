"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import ActivityCard from "@/components/ActivityCard"
import { Spinner } from "./ui/spinner"
import ActivityListControl from "./ActivityListControl"
import { ScrollArea } from "./ui/scroll-area"

export default function ActivitiesList() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/strava/activities")
      const data = await res.json()
      setActivities(data)
    } catch (err) {
      console.error("Failed to fetch activities", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const uniqueSports = useMemo(() => {
    const set = new Set<string>()
    for (const a of activities) if (a?.sport_type) set.add(a.sport_type)
    return Array.from(set).sort()
  }, [activities])

  const [filters, setFilters] = useState<{
    sports?: string[]
    hasRouteMap?: boolean
    hasHeartRate?: boolean
    hasDistance?: boolean
  }>({})

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (filters.sports?.length && !filters.sports.includes(a.sport_type)) return false
      if (filters.hasRouteMap && !a.map?.summary_polyline) return false
      if (filters.hasHeartRate && !(a.average_heartrate > 0)) return false
      if (filters.hasDistance && !(a.distance > 0)) return false
      return true
    })
  }, [activities, filters])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  if (loading)
    return (
      <>
        <ActivityListControl
          sports={uniqueSports}
          onFilterChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
          onRefresh={fetchActivities}
          disabled={loading}
        />
        <p className="flex items-center gap-2">
          <Spinner />
          Loading activities...
        </p>
      </>
    )

  if (!activities.length) return <p>No activities found.</p>

  return (
    <>
      <ActivityListControl
        sports={uniqueSports}
        onFilterChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        onRefresh={fetchActivities}
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activities match your filters.</p>
      ) : (
        <ScrollArea className="h-[89.2vh] w-full rounded-md border p-3 bg-card">
          <div className="grid gap-4 ">
            {filtered.map((a) => (
              <ActivityCard
                key={a.id}
                start_date={a.start_date}
                name={a.name}
                sport_type={a.sport_type}
                heartrate={a.average_heartrate}
                distance={a.distance}
                moving_time={a.moving_time}
                summary_polyline={a.map?.summary_polyline}
                average_speed={a.average_speed}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  )
}
