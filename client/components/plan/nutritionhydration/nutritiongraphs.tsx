"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Label } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DayKey } from "@/lib/types"
import { NutritionNotes } from "./nutritiondaynotes"

type MacroPlan = {
  carbs_pct: number
  protein_pct: number
  fat_pct: number
  notes?: string | null
}
type NutritionPlan = {
  average_macros: MacroPlan
  training_day_macros: MacroPlan
  race_day_macros: MacroPlan
  rationale?: string
}

const chartConfig: ChartConfig = {
  value: { label: "Value", color: "var(--chart-1)" },
  carbs: { label: "Carbs", color: "var(--chart-1)" },
  protein: { label: "Protein", color: "var(--chart-2)" },
  fat: { label: "Fat", color: "var(--chart-3)" },
}

export default function NutritionGraphs({
  nutritionPlan,
  selectedDay,
  notes = true, // NEW: toggle notes; default on to preserve current behavior
}: {
  nutritionPlan: NutritionPlan
  selectedDay: DayKey
  notes?: boolean
}) {
  if (!nutritionPlan) {
    return <p className="text-muted-foreground">No nutrition plan available.</p>
  }

  const selectedMap: Record<DayKey, { label: string; data: MacroPlan }> = {
    average_day: { label: "Average Day", data: nutritionPlan.average_macros },
    training_day: { label: "Training Day", data: nutritionPlan.training_day_macros },
    race_day: { label: "Race Day", data: nutritionPlan.race_day_macros },
  }
  const current = selectedMap[selectedDay]
  const m = current.data

  const chartData = [
    { macro: "Carbs", key: "carbs", value: m.carbs_pct, fill: "var(--chart-1)" },
    { macro: "Protein", key: "protein", value: m.protein_pct, fill: "var(--chart-2)" },
    { macro: "Fat", key: "fat", value: m.fat_pct, fill: "var(--chart-3)" },
  ]

  const total = m.carbs_pct + m.protein_pct + m.fat_pct

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const active = activeIndex != null ? chartData[activeIndex] : null

  return (
    <div className="">
      <Card className="border-none">
        <CardContent className="flex-1">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[260px]"
          >
            <PieChart className="select-none">
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    valueFormatter={(v, _i, payload) =>
                      `${payload?.payload?.macro ?? ""}: ${v}%`
                    }
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="macro"
                innerRadius={60}
                strokeWidth={5}
                isAnimationActive={false}
                onMouseEnter={(_, idx) => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const centerTop = active ? `${active.value}%` : `${total}%`
                      const centerBottom = active ? active.macro : "Macros"
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {centerTop}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            {centerBottom}
                          </tspan>
                        </text>
                      )
                    }
                    return null
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Show notes only when toggled on */}
      {notes && <NutritionNotes day={current.data} dayLabel={current.label} />}
    </div>
  )
}
