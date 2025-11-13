// client/lib/types/api.ts
import type { RunnerProfile, RecentRun } from "./runner";
import type { TrainingPlan } from "./workout";
import type { HydrationPlan } from "./hydration";
import type { NutritionPlan } from "./nutrition";

export interface PlanRequestBody {
  instruction: string;
  country: string;
  weeks: number;
  runner_profile: RunnerProfile;
  recent_runs: RecentRun[];
  goal_description: string;
  address?: string;
}

export interface PlanResponse {
  plan: TrainingPlan;
  hydration_plan?: HydrationPlan | null;
  nutrition_plan?: NutritionPlan | null;
}
