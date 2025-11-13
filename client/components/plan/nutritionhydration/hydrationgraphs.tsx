"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { HydrationPlan, DayHydration } from "@/lib/types/hydration"
import { DayKey } from "@/lib/types"
import { HydrationNotes } from "./hydrationdaynotes"

const chartConfig: ChartConfig = {
  value: { label: "Value", color: "var(--chart-1)" },
}

const z = (n?: number | null) => (typeof n === "number" ? n : 0)

function fluidsData(day: DayHydration) {
  return [
    { section: "Daily",    value: z(day.daily.baseline_fluids_ml),        unit: "ml" },
    { section: "Pre-run",  value: z(day.pre_run.fluids_ml),               unit: "ml" },
    { section: "During",   value: z(day.during_run.fluids_ml_per_hour),   unit: "ml/hr" },
    { section: "Post-run", value: z(day.post_run.fluids_ml),              unit: "ml" },
  ]
}

function sodiumData(day: DayHydration) {
  return [
    { section: "Pre-run",  value: z(day.pre_run.sodium_mg),              unit: "mg" },
    { section: "During",   value: z(day.during_run.sodium_mg_per_hour),  unit: "mg/hr" },
    { section: "Post-run", value: z(day.post_run.sodium_mg),             unit: "mg" },
  ]
}

function carbsData(day: DayHydration) {
  return [
    { section: "During", value: z(day.during_run.carbs_g_per_hour), unit: "g/hr" },
  ]
}

function domainMaxFor(data: Array<{ value: number }>, pad = 1.15) {
  const m = Math.max(0, ...data.map((d) => d.value))
  return Math.ceil(m * pad)
}

function DayMetricChart({
  title,
  data,
  domainMax,
}: {
  title: string
  data: Array<{ section: string; value: number; unit: string }>
  domainMax: number
}) {
  return (
    <Card className="w-full border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {title}{" "}
          <span className="text-xs text-muted-foreground font-normal">
            {title === "Fluids" ? "(ml · ml/hr)" : title === "Sodium" ? "(mg · mg/hr)" : "(g/hr)"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data} accessibilityLayer margin={{ top: 10, bottom: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="section" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis domain={[0, domainMax]} tickLine={false} axisLine={false} width={40} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  valueFormatter={(v, _i, payload) =>
                    `${v} ${payload?.payload?.unit ?? ""}`.trim()
                  }
                />
              }
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={4}>
              <LabelList
                dataKey="value"
                position="top"
                className="text-[10px] fill-current text-muted-foreground"
                formatter={(v: number, _i: number, payload: any) =>
                  `${v}${payload?.unit ? ` ${payload.unit}` : ""}`
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default function HydrationGraphs({
  hydrationPlan,
  selectedDay,
  notes = true, // NEW: default to true to preserve current behavior
}: {
  hydrationPlan: HydrationPlan
  selectedDay: DayKey
  notes?: boolean
}) {
  if (!hydrationPlan) {
    return <p className="text-muted-foreground">No hydration plan available.</p>
  }

  const dayMap: Record<DayKey, { label: string; data: DayHydration }> = {
    average_day: { label: "Average Day", data: hydrationPlan.average_day },
    training_day: { label: "Training Day", data: hydrationPlan.training_day },
    race_day:     { label: "Race Day",     data: hydrationPlan.race_day },
  }

  const current = dayMap[selectedDay]
  const fluids = fluidsData(current.data)
  const sodium = sodiumData(current.data)
  const carbs = carbsData(current.data)

  const fluidsMax = domainMaxFor(fluids)
  const sodiumMax = domainMaxFor(sodium)
  const carbsMax = domainMaxFor(carbs)

  return (
    <div className="">
      <div className="grid gap-4 md:grid-cols-3">
        <DayMetricChart title="Fluids" data={fluids} domainMax={fluidsMax} />
        <DayMetricChart title="Sodium" data={sodium} domainMax={sodiumMax} />
        <DayMetricChart title="Carbs" data={carbs} domainMax={carbsMax} />
      </div>

      {/* Show notes only when toggled on */}
      {notes && <HydrationNotes day={current.data} dayLabel={current.label} />}
    </div>
  )
}
