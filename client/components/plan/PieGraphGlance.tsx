import { WeeklyPlan } from "@/lib/types/runbuddy"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { useMemo } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { ChevronDown } from "lucide-react"
import { Cell, LabelList, Pie, PieChart } from "recharts"

const TRAINING_TYPES = [
    "easy",
    "long_run",
    "intervals",
    "tempo",
    "recovery",
    "rest",
] as const
type TrainingType = (typeof TRAINING_TYPES)[number]


const trainingTypePieConfig = {
    easy: { label: "Easy", color: "var(--chart-1)" },
    long_run: { label: "Long run", color: "var(--chart-2)" },
    intervals: { label: "Intervals", color: "var(--chart-3)" },
    tempo: { label: "Tempo", color: "var(--chart-4)" },
    recovery: { label: "Recovery", color: "var(--chart-5)" },
    rest: { label: "Rest", color: "var(--chart-6)" },
} satisfies ChartConfig

type TrainingTypeSplitProps = {
    weeklyPlans: WeeklyPlan[]
    defaultOpen?: boolean
}

export function PieGraphGlance({
    weeklyPlans,
    defaultOpen = false,
}: TrainingTypeSplitProps) {
    const pieData = useMemo(() => {
        const counts: Record<TrainingType, number> = {
            easy: 0,
            long_run: 0,
            intervals: 0,
            tempo: 0,
            recovery: 0,
            rest: 0,
        }

        for (const week of weeklyPlans) {
            for (const w of week.workouts ?? []) {
                const focus = (w.focus || "").toLowerCase() as TrainingType

                if (TRAINING_TYPES.includes(focus)) {
                    counts[focus] += 1
                } else {
                    counts.rest += 1
                }
            }
        }

        return TRAINING_TYPES.map((type) => ({
            type,
            label: trainingTypePieConfig[type].label,
            value: counts[type],
        })).filter((d) => d.value > 0)
    }, [weeklyPlans])

    const totalDays = pieData.reduce((sum, d) => sum + d.value, 0)

    return (
        <Collapsible defaultOpen={defaultOpen} asChild>
            <Card className="border-none w-full">
                <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
                    <CardTitle className="text-base font-bold">
                        Training Day Split
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
                        {pieData.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                                No workouts found to calculate training split.
                            </p>
                        ) : (
                            <ChartContainer
                                config={trainingTypePieConfig}
                                className="h-48 w-full flex items-center justify-center"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="label"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                    >
                                        {pieData.map((entry) => (
                                            <Cell
                                                key={entry.type}
                                                fill={`var(--color-${entry.type})`}
                                            />
                                        ))}
                                        <LabelList
                                            dataKey="value"
                                            position="outside"
                                            className="fill-foreground"
                                            fontSize={11}
                                            formatter={(value: number, entry: any) => {
                                                // entry.payload is your { type, label, value } object
                                                const label = entry?.payload?.label ?? ""
                                                if (!totalDays || !label) return value

                                                const pct = ((value / totalDays) * 100).toFixed(0)
                                                return `${label} (${pct}%)`
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col items-start gap-1 text-xs">
                        <div className="leading-none">
                            Total training / rest days counted: {totalDays}
                        </div>
                        <div className="text-muted-foreground leading-none">
                            Based on workout focus and distance.
                        </div>
                    </CardFooter>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}