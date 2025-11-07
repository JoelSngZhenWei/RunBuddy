"use client";

import { useEffect, useState } from "react";
import type { PlanRequestBody, TrainingPlan } from "@/lib/types/runbuddy";
import { requestTrainingPlan } from "@/lib/api/runbuddy";

export default function Test() {
  const [data, setData] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const payload: PlanRequestBody = {
      instruction: "Build a 4-week training plan",
      weeks: 4,
      runner_profile: {
        name: "Joel Sng",
        age: 25,
        sex: "male",
        experience_level: "intermediate",
        weekly_mileage_km: 40.0,
        preferred_units: "km",
        available_days: ["Mon", "Wed", "Sat", "Sun"],
        constraints: ["No long run above 21km."],
      },
      recent_runs: [
        {
          date: "2025-10-28",
          distance_km: 10.2,
          duration_min: 54.0,
          avg_pace_min_per_km: 5.29,
          notes: "Felt strong but last 2km were hard",
        },
        {
          date: "2025-10-30",
          distance_km: 6.0,
          duration_min: 34.0,
          avg_pace_min_per_km: 5.67,
          notes: "Easy neighborhood run",
        },
        {
          date: "2025-11-02",
          distance_km: 14.0,
          duration_min: 80.0,
          avg_pace_min_per_km: 5.71,
          notes: "Long run, knee a bit sore in last 3km",
        },
      ],
      goal_description: "Run a sub-50-minute 10K race in 10 weeks.",
    };

    async function fetchPlan() {
      try {
        setLoading(true);
        setError(null);
        const result = await requestTrainingPlan(payload); // hits /api/plan → FastAPI
        setData(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-xl font-bold mb-4">Test Plan API</h1>

      {loading && <p>Loading plan...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {data && (
        <pre className="mt-4 p-4 rounded text-xs overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
