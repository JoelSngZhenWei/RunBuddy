// client/lib/types/nutrition.ts
export interface Macros {
    carbs_pct: number;   // 0..100
    protein_pct: number; // 0..100
    fat_pct: number;     // 0..100
    notes?: string | null;
}

export interface NutritionPlan {
    average_macros: Macros;
    training_day_macros: Macros;
    race_day_macros: Macros;
    rationale?: string | null;
}
