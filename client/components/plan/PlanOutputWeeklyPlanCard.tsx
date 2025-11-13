"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { WeeklyPlan } from "@/lib/types/runbuddy";
import { WorkoutGraph } from "./WorkoutGraph";

type WeeklyPlanCardProps = {
  week: WeeklyPlan;
};

const DAY_ORDER: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyPlanCard({ week }: WeeklyPlanCardProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const workouts = week.workouts ?? [];

  const selectedWorkouts =
    selectedDay != null
      ? workouts.filter((w) => w.day === selectedDay)
      : [];
  const mainSelected = selectedWorkouts[0];

  return (
    <Card className="mb-4">
      <CardContent className="">
        {/* 7-day row */}
        <div className=" grid grid-cols-5">
          <div className="col-span-3">
            <div className="flex flex-col gap-3">
              <div className="text-base font-bold">
                Week {week.week_number}
              </div>
              <div className="text-muted-foreground">
                {week.focus_summary}
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-3">
                  {DAY_ORDER.map((day) => {
                    const dayWorkouts = workouts.filter((w) => w.day === day);
                    const main = dayWorkouts[0];
                    const hasWorkout = !!main;
                    const isSelected = selectedDay === day;

                    const typeLabel = hasWorkout
                      ? main.focus.replace("_", " ").toUpperCase()
                      : "REST";

                    const distanceLabel =
                      hasWorkout && main.distance_km != null && main.distance_km > 0
                        ? `${main.distance_km.toFixed(1)} km`
                        : "—";

                    const paceLabel =
                      hasWorkout && main.target_pace_min_per_km != null
                        ? `${main.target_pace_min_per_km.toFixed(2)} min/km`
                        : "—";

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setSelectedDay((prev) => (prev === day ? null : day))
                        }
                        className={[
                          "rounded-md border bg-muted px-2 py-3 flex flex-col items-center justify-center",
                          "text-center gap-1 transition-colors cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:bg-muted/50",
                        ].join(" ")}
                      >
                        {/* Row 1: Day */}
                        <span className="font-semibold ">{day}</span>

                        {/* Row 2: Workout type (ALL CAPS or REST) */}
                        <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                          {typeLabel}
                        </span>

                        {/* Row 3: Distance */}
                        <span className="text-[0.7rem] text-muted-foreground">
                          {distanceLabel}
                        </span>

                        {/* Row 4: Pace */}
                        <span className="text-[0.7rem] text-muted-foreground">
                          {paceLabel}
                        </span>
                        
                      </button>
                    );
                  })}

                </div>
              </div>
              {/* Full-width details below the 7-day row */}
              {selectedDay && (
                <div className="rounded-md border border-muted bg-muted p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {selectedDay}{" "}
                        {mainSelected
                          ? `· ${mainSelected.focus.replace("_", " ")}`
                          : "· Rest"}
                      </div>
                      {mainSelected &&
                        mainSelected.distance_km != null &&
                        mainSelected.distance_km > 0 && (
                          <div className=" text-muted-foreground">
                            {mainSelected.distance_km} km
                            {mainSelected.target_pace_min_per_km != null &&
                              ` @ ~${mainSelected.target_pace_min_per_km.toFixed(2)} min/km`}
                          </div>
                        )}
                    </div>
                  </div>

                  <p className=" text-muted-foreground">
                    {mainSelected
                      ? mainSelected.description
                      : "Rest / No run planned for this day."}
                  </p>

                  {mainSelected?.notes && (
                    <div className="mt-2 rounded-md bg-background p-3 border border-border">
                      <p className="text-sm font-medium mb-2">📝 Notes</p>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {mainSelected.notes}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
          <div className="col-span-2">
            <WorkoutGraph workouts={week.workouts ?? []} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
