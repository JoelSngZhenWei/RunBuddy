import type { Day } from "./common";

export type WorkoutFocus =
  | "easy"
  | "long_run"
  | "intervals"
  | "tempo"
  | "recovery"
  | "rest";

export interface Workout {
  day: Day;
  focus: WorkoutFocus;
  distance_km?: number | null;          // 0 or null for rest
  target_pace_min_per_km?: number | null;
  description: string;
  notes?: string | null;
}

export interface WeeklyPlan {
  week_number: number;
  focus_summary: string;
  workouts: Workout[];
}

export interface TrainingPlan {
  // runner_name: string;
  goal_description: string;
  plan_duration_weeks: number;
  weekly_overview: string;
  weekly_plans: WeeklyPlan[];
}