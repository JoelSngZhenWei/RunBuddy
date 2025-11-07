// client/lib/api/runbuddy.ts
import type { PlanRequestBody, TrainingPlan } from "@/lib/types/runbuddy";

export async function requestTrainingPlan(
  payload: PlanRequestBody
): Promise<TrainingPlan> {
  const res = await fetch("/api/plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch training plan: ${res.status} ${res.statusText} - ${text}`
    );
  }

  return (await res.json()) as TrainingPlan;
}
