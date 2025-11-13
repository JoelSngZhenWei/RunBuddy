"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react"
import { NutritionPlan, DayKey } from "@/lib/types"
import NutritionGraphs from "./nutritiongraphs"

export function NutritionPlanDisplay({
    nutritionPlan,
    selectedDay,
    onSelectedDayChange,
}: {
    nutritionPlan: NutritionPlan
    selectedDay: DayKey
    onSelectedDayChange: (day: DayKey) => void
}) {
    const rationale = nutritionPlan.rationale?.trim()

    return (
        <Card className="border-none">
            <CardHeader>
                <CardTitle className="text-center text-base">Nutrition Plan</CardTitle>
                {rationale && (
                    <CardDescription className="w-full text-base text-muted-foreground leading-relaxed">
                        {rationale}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-4">

                <NutritionGraphs
                    nutritionPlan={nutritionPlan}
                    selectedDay={selectedDay}
                    onSelectedDayChange={onSelectedDayChange}
                    notes={true}
                />
            </CardContent>
        </Card>
    )
}
