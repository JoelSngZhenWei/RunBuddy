// client/lib/types/hydration.ts
export interface DailyBaseline {
    baseline_fluids_ml: number;
    electrolyte_mg?: number | null;
    notes?: string | null;
}

export interface PreRun {
    timing_min_before: number;  // 0..180
    fluids_ml: number;
    sodium_mg?: number | null;
    notes?: string | null;
}

export interface DuringRun {
    fluids_ml_per_hour: number;
    sodium_mg_per_hour: number;
    carbs_g_per_hour?: number | null;
    notes?: string | null;
}

export interface PostRun {
    fluids_ml?: number | null; // if using volume rule
    sodium_mg?: number | null;
    notes?: string | null;
}

export interface DayHydration {
    daily: DailyBaseline;
    pre_run: PreRun;
    during_run: DuringRun;
    post_run: PostRun;
    notes?: string | null;
}

export interface HydrationPlan {
    average_day: DayHydration;
    training_day: DayHydration;
    race_day: DayHydration;
    rationale?: string | null;
}
