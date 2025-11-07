// client/lib/types/runbuddy.ts

export type Sex = "male" | "female" | "other";

export interface RunnerProfile {
  name: string;
  age: number;
  sex: Sex;
  experience_level: "beginner" | "intermediate" | "advanced";
  weekly_mileage_km: number;
  preferred_units: "km" | "miles";
  available_days: string[]; // ["Mon", "Wed", "Sat", "Sun"]
  constraints?: string[];
}

export interface RecentRun {
  date: string; // ISO date string
  distance_km: number;
  duration_min: number;
  avg_pace_min_per_km: number;
  notes?: string;
}

export interface TrainingDay {
  day: string;              // "Mon", "Tue", etc.
  workout_type: string;     // "Easy Run", "Intervals", etc.
  description: string;
  distance_km?: number | null;
  notes?: string | null;
}

export interface WeeklyPlan {
  week_number: number;
  days: TrainingDay[];
}

export interface WeeklyOverview {
  week_number: number;
  focus: string;
  total_distance_km: number;
}

export interface TrainingPlan {
  runner_name: string;
  goal_description: string;
  plan_duration_weeks: number;
  weekly_overview: WeeklyOverview[];
  weekly_plans: WeeklyPlan[];
}

export interface PlanRequestBody {
  instruction: string;
  weeks: number;
  runner_profile: RunnerProfile;
  recent_runs: RecentRun[];
  goal_description: string;
}
