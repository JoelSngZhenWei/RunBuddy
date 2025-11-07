// client/hooks/useTrainingPlan.ts
"use client";

import { useState } from "react";
import type { PlanRequestBody, TrainingPlan } from "@/lib/types/runbuddy";
import { requestTrainingPlan } from "@/lib/api/runbuddy";

export function useTrainingPlan() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePlan(payload: PlanRequestBody) {
    setLoading(true);
    setError(null);

    try {
      const result = await requestTrainingPlan(payload);
      setPlan(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to generate training plan");
    } finally {
      setLoading(false);
    }
  }

  return {
    plan,
    loading,
    error,
    generatePlan,
  };
}
