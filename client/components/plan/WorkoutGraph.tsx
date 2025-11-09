"use client";

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
import { Workout } from "@/lib/types/runbuddy";

type WorkoutGraphProps = {
    workouts: Workout[];
};

const DAY_ORDER: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const chartConfig = {
    distance: {
        label: "Distance (km)",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export const description = "Recommended workout distance";

export function WorkoutGraph({ workouts }: WorkoutGraphProps) {
    // Aggregate total distance per day (Mon–Sun)
    const chartData = DAY_ORDER.map((day) => {
        const totalDistance = workouts
            .filter((w) => w.day === day && w.distance_km != null && w.distance_km > 0)
            .reduce((sum, w) => sum + (w.distance_km ?? 0), 0);

        return { day, distance: Number(totalDistance.toFixed(2)) };
    });

    const totalDistance = chartData.reduce((sum, d) => sum + d.distance, 0);

    return (
        <Card className="border-none">
            <CardHeader className="">
                <CardTitle className="text-sm font-semibold">
                    Weekly Distance
                </CardTitle>
            </CardHeader>

            <CardContent className="">
                <ChartContainer config={chartConfig} className="h-35 w-full">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ top: 20, right: 12, left: 12, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
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
                            {/* ✅ Only show label if distance > 0 */}
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

            <CardFooter className="flex-col items-start gap-1 text-xs ">
                <div className="flex gap-2 font-medium leading-none">
                    Total mileage: {totalDistance.toFixed(1)} km
                </div>
            </CardFooter>
        </Card>
    );
}
