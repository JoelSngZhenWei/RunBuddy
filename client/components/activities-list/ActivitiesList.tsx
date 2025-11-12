"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ActivityCard from "@/components/activities-list/ActivityCard";

import { ScrollArea } from "../ui/scroll-area";

import { toast } from "sonner";
import { FaRunning } from "react-icons/fa";
import ActivityListControl from "./ActivityListControl";
import ActivityCardSkeleton from "./ActivityCardSkeleton";

export default function ActivitiesList() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/strava/activities");

      // Check if response is ok
      if (!res.ok) {
        throw new Error(
          `Failed to fetch activities: ${res.status} ${res.statusText}`
        );
      }

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Received non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();

      // Handle error in JSON response
      if (data.error) {
        console.error("API error:", data.error);
        // Still use data if available (degraded mode)
        if (data.data && Array.isArray(data.data)) {
          setActivities(data.data);
          if (data.degraded) {
            toast.warning("Using cached activities (Strava API unavailable)", {
              duration: 3000,
            });
          }
        } else {
          setActivities([]);
          toast.error("Failed to load activities", {
            description: data.error,
            duration: 3000,
          });
        }
      } else {
        setActivities(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch activities", err);
      setActivities([]);
      toast.error("Failed to load activities", {
        description: err instanceof Error ? err.message : "Unknown error",
        duration: 3000,
      });
    } finally {
      if (activities.length > 0) {
        toast("Activities loaded", {
          duration: 1000,
          icon: <FaRunning className="h-5 w-5 text-strava" />,
        });
      }
      setLoading(false);
    }
  }, []);

  const uniqueSports = useMemo(() => {
    const set = new Set<string>();
    for (const a of activities) if (a?.sport_type) set.add(a.sport_type);
    return Array.from(set).sort();
  }, [activities]);

  const [filters, setFilters] = useState<{
    sports?: string[];
    hasRouteMap?: boolean;
    hasHeartRate?: boolean;
    hasDistance?: boolean;
  }>({});

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (filters.sports?.length && !filters.sports.includes(a.sport_type))
        return false;
      if (filters.hasRouteMap && !a.map?.summary_polyline) return false;
      if (filters.hasHeartRate && !(a.average_heartrate > 0)) return false;
      if (filters.hasDistance && !(a.distance > 0)) return false;
      return true;
    });
  }, [activities, filters]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <>
      <ActivityListControl
        sports={uniqueSports}
        onFilterChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        onRefresh={fetchActivities}
      />
      <ScrollArea className="h-[86.5vh] w-full rounded-md border bg-card">
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            // Empty (or initial) state show two skeletons
            // Populate with an appropriate empty message if needed
            <div className="flex flex-col gap-4">
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
            </div>
          ) : loading ? (
            // Loading while we have filters/data context
            <div className="flex flex-col gap-4">
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
            </div>
          ) : (
            // Loaded list
            <div className="flex flex-col gap-4">
              {filtered.map((a) => (
                <ActivityCard
                  key={a.id}
                  start_date={a.start_date}
                  name={a.name}
                  sport_type={a.sport_type}
                  heartrate={a.average_heartrate}
                  distance={a.distance}
                  moving_time={a.moving_time}
                  summary_polyline={a.map?.summary_polyline ?? ""}
                  average_speed={a.average_speed}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}
