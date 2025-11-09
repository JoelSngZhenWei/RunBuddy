"use client";

import { useMemo } from "react";
import {
    Line,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    LabelList,
} from "recharts";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { WeeklyPlan, Workout } from "@/lib/types/runbuddy";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

type OverallWorkoutGraphProps = {
    weeklyPlans: WeeklyPlan[];
    defaultOpen?: boolean;
};

const chartConfig = {
    distance: {
        label: "Distance (km)",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export const description = "Total weekly mileage across the full plan";

export function OverallWorkoutGraph({
    weeklyPlans,
    defaultOpen = false,
}: OverallWorkoutGraphProps) {
    const { chartData, totalPlanDistance, avgPerWeek } = useMemo(() => {
        const getWeekDistance = (workouts: Workout[]) =>
            workouts
                .filter((w) => w.distance_km != null && w.distance_km > 0)
                .reduce((sum, w) => sum + (w.distance_km ?? 0), 0);

        const chartData = weeklyPlans.map((week, idx) => {
            const weekDistance = getWeekDistance(week.workouts ?? []);
            return {
                weekLabel: `W${week.week_number ?? idx + 1}`,
                distance: Number(weekDistance.toFixed(2)),
            };
        });

        const totalPlanDistance = chartData.reduce(
            (sum, d) => sum + d.distance,
            0
        );
        const avgPerWeek =
            weeklyPlans.length > 0 ? totalPlanDistance / weeklyPlans.length : 0;

        return { chartData, totalPlanDistance, avgPerWeek };
    }, [weeklyPlans]);

    return (
        <Collapsible defaultOpen={defaultOpen} asChild>
            <Card className="border-none">
                <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
                    <CardTitle className="text-base font-bold">
                        Overall Weekly Mileage
                    </CardTitle>

                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 group"
                        >
                            <span className="hidden sm:inline">Toggle</span>
                            <ChevronDown
                                className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
                            />
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="pt-1">
                        <ChartContainer config={chartConfig} className="h-40 w-full">
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
                                    width={30}
                                    tickMargin={4}
                                    tickFormatter={(v) => `${v}`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <Line
                                    dataKey="distance"
                                    type="monotone"
                                    stroke="var(--color-distance, var(--chart-1))"
                                    strokeWidth={2}
                                    dot={{
                                        fill: "var(--color-distance, var(--chart-1))",
                                        r: 4,
                                    }}
                                    activeDot={{
                                        r: 6,
                                        strokeWidth: 1.5,
                                    }}
                                >
                                    <LabelList
                                        dataKey="distance"
                                        position="top"
                                        offset={10}
                                        className="fill-foreground"
                                        fontSize={12}
                                        content={(props) => {
                                            const { x, y, value } = props;
                                            if (!value || value === 0) return null;
                                            return (
                                                <text
                                                    x={x}
                                                    y={y! - 6}
                                                    textAnchor="middle"
                                                    className="fill-foreground"
                                                    fontSize={12}
                                                >
                                                    {value}
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                            </LineChart>
                        </ChartContainer>
                    </CardContent>

                    <CardFooter className="flex flex-col items-start gap-1 text-xs">
                        <div className="leading-none">
                            Total plan mileage: {totalPlanDistance.toFixed(1)} km
                        </div>
                        <div className="text-muted-foreground leading-none">
                            Avg per week: {avgPerWeek.toFixed(1)} km
                        </div>
                    </CardFooter>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
