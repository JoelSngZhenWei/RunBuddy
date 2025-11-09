"use client"

import { TrainingPlan } from "@/lib/types/runbuddy";
import { OverallWorkoutGraph } from "./WorkoutGraphOverall";
import { PaceGraphGlance } from "./PaceGraphGlance";
import { PieGraphGlance } from "./PieGraphGlance";

type WorkoutAtAGlanceProps = {
    plan: TrainingPlan;
};

export function WorkoutAtAGlance({ plan }: WorkoutAtAGlanceProps) {
    const weeklyPlans = plan.weekly_plans ?? []

    return (
        <div className="flex flex-col space-2">
            {/* 1. Total mileage per week (your existing chart) */}
            <OverallWorkoutGraph weeklyPlans={weeklyPlans} defaultOpen />
            <div className="flex flex-row">
                {/* 2. Training-day split pie */}
                <PieGraphGlance weeklyPlans={weeklyPlans} defaultOpen />

                {/* 3. Long-run pace by week */}
                <PaceGraphGlance weeklyPlans={weeklyPlans} defaultOpen />
            </div>
        </div>
    );
}
