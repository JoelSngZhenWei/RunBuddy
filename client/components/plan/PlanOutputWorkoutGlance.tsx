"use client"

import { OverallWorkoutGraph } from "./WorkoutGraphOverall";
import { PaceGraphGlance } from "./PaceGraphGlance";
import { PieGraphGlance } from "./PieGraphGlance";
import { TrainingPlan, HydrationPlan, NutritionPlan } from "@/lib/types";
import NutritionGraphs from "./nutritionhydration/nutritiongraphs";
import HydrationGraphs from "./nutritionhydration/hydrationgraphs";
import { Button } from "../ui/button";
import { DayKey } from "@/lib/types";
import React from "react";
import { Card } from "../ui/card";

type WorkoutAtAGlanceProps = {
    plan: TrainingPlan
    hydrationPlan: HydrationPlan
    nutritionPlan: NutritionPlan
}

export function WorkoutAtAGlance({
    plan,
    hydrationPlan,
    nutritionPlan,
}: WorkoutAtAGlanceProps) {
    const weeklyPlans = plan.weekly_plans ?? []
    const [selectedDay, setSelectedDay] = React.useState<DayKey>("average_day")

    return (
        <div className="flex flex-col space-y-2">
            {/* 1. Total mileage per week */}
            <Card className="border rounded-lg">
                <OverallWorkoutGraph weeklyPlans={weeklyPlans} defaultOpen />
            </Card>

            {/* 2. Training split + pace glance */}
            <div className="flex flex-row gap-2">
                <Card className="flex-1 border rounded-lg">
                    <PieGraphGlance weeklyPlans={weeklyPlans} defaultOpen />
                </Card>
                <Card className="flex-1 border rounded-lg">
                    <PaceGraphGlance weeklyPlans={weeklyPlans} defaultOpen />
                </Card>
            </div>

            {/* 3. Day selection buttons */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    {(["average_day", "training_day", "race_day"] as DayKey[]).map((day) => (
                        <Button
                            key={day}
                            size="sm"
                            variant={selectedDay === day ? "default" : "outline"}
                            onClick={() => setSelectedDay(day)}
                        >
                            {day === "average_day"
                                ? "Average Day"
                                : day === "training_day"
                                    ? "Training Day"
                                    : "Race Day"}
                        </Button>
                    ))}
                </div>
                {/* 4. Hydration & Nutrition graphs */}
                <Card className="border rounded-lg">
                    <HydrationGraphs
                        hydrationPlan={hydrationPlan}
                        selectedDay={selectedDay}
                        onSelectedDayChange={setSelectedDay}
                        notes={false}
                    />
                </Card>

                <Card className="border rounded-lg">
                    <NutritionGraphs
                        nutritionPlan={nutritionPlan}
                        selectedDay={selectedDay}
                        onSelectedDayChange={setSelectedDay}
                        notes={false}
                    />
                </Card>
            </Card>

        </div>
    )
}