"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react"
import HydrationGraphs from "./hydrationgraphs"
import { HydrationPlan, DayKey } from "@/lib/types"

export function HydrationPlanDisplay({
    hydrationPlan,
    selectedDay,
    onSelectedDayChange,              // ⬅️ add
}: {
    hydrationPlan: HydrationPlan
    selectedDay: DayKey
    onSelectedDayChange: (day: DayKey) => void   // ⬅️ add
}) {
    const rationale = hydrationPlan.rationale.trim()

    return (
        <Card className="border-none">
            <CardHeader>
                <CardTitle className="text-center">Hydration Plan</CardTitle>
                {rationale && (
                    <CardDescription className="w-full text-base text-muted-foreground leading-relaxed">
                        {rationale}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-4">

                <HydrationGraphs
                    hydrationPlan={hydrationPlan}
                    selectedDay={selectedDay}
                    onSelectedDayChange={onSelectedDayChange}
                />
            </CardContent>
        </Card>
    )
}
