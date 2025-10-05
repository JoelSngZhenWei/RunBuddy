"use client"

import { useEffect, useState } from "react"
import ActivityCard from "@/components/ActivityCard"

export default function ActivitiesList() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/strava/activities")
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((err) => console.error("Failed to fetch activities", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading activities...</p>

  if (!activities.length) return <p>No activities found.</p>

  return (
    <div className="grid gap-4">
      {activities.map((a) => (
        <ActivityCard
          key={a.id}
          name={a.name}
          distance={a.distance}
          moving_time={a.moving_time}
          start_date={a.start_date}
          summary_polyline={a.map?.summary_polyline}
          average_speed={a.average_speed}
        />
      ))}
    </div>
  )
}
