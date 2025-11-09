import { WeeklyPlan, Workout } from "@/lib/types/runbuddy"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { useMemo } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { ChevronDown } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"

const longRunPaceConfig = {
    pace: {
        label: "Long run pace (min/km)",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

type LongRunPaceByWeekProps = {
    weeklyPlans: WeeklyPlan[]
    defaultOpen?: boolean
}

function getLongRunPace(workout: Workout): number | null {
    // Adapt these fields to your schema as needed
    if (workout.focus !== "long_run") return null

    const fromTarget = (workout as any).target_pace_min_per_km
    const fromAvg = (workout as any).avg_pace_min_per_km

    const pace = fromTarget ?? fromAvg
    return typeof pace === "number" ? pace : null
}

export function PaceGraphGlance({
    weeklyPlans,
    defaultOpen = false,
}: LongRunPaceByWeekProps) {
    const chartData = useMemo(() => {
        return weeklyPlans.map((week, idx) => {
            const longRunPaces: number[] = []

            for (const w of week.workouts ?? []) {
                const pace = getLongRunPace(w)
                if (pace != null && pace > 0) {
                    longRunPaces.push(pace)
                }
            }

            const avgPace =
                longRunPaces.length > 0
                    ? longRunPaces.reduce((s, p) => s + p, 0) / longRunPaces.length
                    : null

            return {
                weekLabel: `W${week.week_number ?? idx + 1}`,
                pace: avgPace ? Number(avgPace.toFixed(2)) : null,
            }
        })
    }, [weeklyPlans])

    const hasData = chartData.some((d) => d.pace != null)

    return (
        <Collapsible defaultOpen={defaultOpen} asChild>
            <Card className="border-none w-full">
                <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
                    <CardTitle className="text-base font-bold">
                        Long Run Pace by Week
                    </CardTitle>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 group"
                        >
                            <span className="hidden sm:inline">Toggle</span>
                            <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="pt-1">
                        {!hasData ? (
                            <p className="text-xs text-muted-foreground">
                                No long run pace data available. Make sure long runs have a pace
                                field.
                            </p>
                        ) : (
                            <ChartContainer config={longRunPaceConfig} className="h-40 w-full">
                                <LineChart
                                    accessibilityLayer
                                    data={chartData}
                                    margin={{ top: 20, right: 12, left: 12, bottom: 0 }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="weekLabel"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={40}
                                        tickMargin={4}
                                        tickFormatter={(v) => `${v.toFixed(1)}`}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" />}
                                    />
                                    <Line
                                        dataKey="pace"
                                        type="monotone"
                                        stroke="var(--color-pace, var(--chart-2))"
                                        strokeWidth={2}
                                        dot={{
                                            fill: "var(--color-pace, var(--chart-2))",
                                            r: 4,
                                        }}
                                        activeDot={{
                                            r: 6,
                                            strokeWidth: 1.5,
                                        }}
                                        connectNulls
                                    >
                                        <LabelList
                                            dataKey="pace"
                                            position="top"
                                            offset={10}
                                            className="fill-foreground"
                                            fontSize={12}
                                            content={(props) => {
                                                const { x, y, value } = props
                                                if (value == null) return null
                                                return (
                                                    <text
                                                        x={x}
                                                        y={y! - 6}
                                                        textAnchor="middle"
                                                        className="fill-foreground"
                                                        fontSize={12}
                                                    >
                                                        {value.toFixed(1)}
                                                    </text>
                                                )
                                            }}
                                        />
                                    </Line>
                                </LineChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}