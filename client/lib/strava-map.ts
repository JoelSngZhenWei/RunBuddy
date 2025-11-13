// lib/strava-map.ts
import type { RecentRun } from "@/lib/types";

const r2 = (n: number) => Math.round(n * 100) / 100;
const r1 = (n: number) => Math.round(n * 10) / 10;

function paceMinPerKm(km: number, movingSec?: number, elapsedSec?: number) {
  const mins = (movingSec ?? elapsedSec ?? 0) / 60;
  if (!km || km <= 0) return 0;
  return r2(mins / km);
}

// Accept both older "type" and newer "sport_type" = "Run"
const isRun = (a: any) =>
  (a?.type?.toLowerCase?.() === "run") || (a?.sport_type?.toLowerCase?.() === "run");

export function activitiesToRecentRuns(acts: any[], limit = 10): RecentRun[] {
  return (acts ?? [])
    .filter(isRun)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.start_date_local ?? b.start_date).getTime() -
        new Date(a.start_date_local ?? a.start_date).getTime()
    )
    .slice(0, limit)
    .map((a) => {
      const km = r2((a.distance ?? 0) / 1000);
      const durationMin = r1((a.moving_time ?? a.elapsed_time ?? 0) / 60);
      return {
        date: (a.start_date_local ?? a.start_date ?? "").slice(0, 10),
        distance_km: km,
        duration_min: durationMin,
        avg_pace_min_per_km: paceMinPerKm(km, a.moving_time, a.elapsed_time),
        notes: a.name ?? a.type ?? undefined,
      };
    });
}
