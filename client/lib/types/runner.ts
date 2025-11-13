import type { Sex, Units, Day, ISODateString } from "./common";

export interface RunnerProfile {
  name: string;
  age: number;
  sex: Sex;
  experience_level: "beginner" | "intermediate" | "advanced";
  weekly_mileage_km: number;
  preferred_units: Units;
  available_days: Day[];            // ["Mon", "Wed", ...]
  constraints?: string[];
}

export interface RecentRun {
  date: ISODateString;              // ISO date string
  distance_km: number;
  duration_min: number;
  avg_pace_min_per_km: number;
  notes?: string;
}
