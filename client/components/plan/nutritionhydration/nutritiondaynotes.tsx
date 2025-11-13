"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import type { Macros } from "@/lib/types/nutrition"

export function NutritionNotes({
  day,
  dayLabel,
  rationale,
}: {
  day: Macros
  dayLabel: string
  rationale?: string | null
}) {
  const dayNote = day.notes?.trim()

  return (
    <Card className="w-full border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{dayLabel} Nutrition</CardTitle>
        {(dayNote || rationale) && (
          <CardDescription className="leading-relaxed text-base space-y-1">
            {dayNote && <p>{dayNote}</p>}
            {rationale && <p>{rationale}</p>}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="text-base text-muted-foreground space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div><span className="font-medium text-foreground">Carbs:</span> {day.carbs_pct}%</div>
          <div><span className="font-medium text-foreground">Protein:</span> {day.protein_pct}%</div>
          <div><span className="font-medium text-foreground">Fat:</span> {day.fat_pct}%</div>
        </div>
      </CardContent>
    </Card>
  )
}
