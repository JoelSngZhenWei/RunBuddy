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

export interface Workout {
  day: string;              // "Mon", "Tue", etc.
  focus: string;
  distance_km?: number | null;
  target_pace_min_per_km?: number | null;
  description: string;
  notes?: string | null;
}

export interface WeeklyPlan {
  week_number: number;
  focus_summary: string;
  workouts: Workout[];
}

// export interface WeeklyOverview {
//   week_number: number;
//   focus: string;
//   total_distance_km: number;
// }

export interface TrainingPlan {
  // runner_name: string;
  goal_description: string;
  plan_duration_weeks: number;
  weekly_overview: string;
  weekly_plans: WeeklyPlan[];
}

export interface PlanRequestBody {
  instruction: string;
  country: string;
  weeks: number;
  runner_profile: RunnerProfile;
  recent_runs: RecentRun[];
  goal_description: string;
}
