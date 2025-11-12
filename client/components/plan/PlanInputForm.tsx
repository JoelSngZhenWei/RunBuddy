"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trainingPlanSchema } from "@/lib/schemas/TrainingPlanSchema";
import { Checkbox } from "@/components/ui/checkbox";
import {
  fetchCalendarEvents,
  formatEventsForTrainingPlan,
  generateCalendarBasedRecommendations,
} from "@/lib/calendar-utils";
import GoogleLogInButton from "@/components/GoogleLogInButton";
import GoogleLogoutButton from "@/components/GoogleLogoutButton";
import { Calendar, CheckCircle2, XCircle, Watch } from "lucide-react"
import { usePlan } from "@/contexts/PlanContext";
import { toast } from "sonner";
import { requestTrainingPlan } from "@/lib/api/runbuddy";
import { PlanRequestBody } from "@/lib/types/runbuddy";
import { DatePickerField } from "../Datepicker";
import { ScrollArea } from "../ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { activitySummaries } from "@/fixtures/wearable-data-samples"

type FormValues = z.infer<typeof trainingPlanSchema>;

export function PlanInputForm({ focus }: { focus: "input" | "output" }) {
  const [isGoogleConnected, setIsGoogleConnected] = React.useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = React.useState(false);
  const [calendarStatus, setCalendarStatus] = React.useState<string>("");
  const { setGeneratedPlan, setIsGenerating, setFocus } = usePlan();

  const form = useForm<FormValues>({
    resolver: zodResolver(trainingPlanSchema),
    defaultValues: {
      goal_event: "",
      goal_target: "",
      days_per_week: 4,
      current_weekly_km: 35,
      fitness_level: "Intermediate",
      country: "",
      injury: "",
      start_date: "",
      goal_date: "",
      use_calendar: false,
      calendar_events_summary: "",
      use_wearable: false,
      wearable_data: activitySummaries.sedentary,
      activity_level: "sedentary" as const,
    },
  });

  // Check if user is connected to Google Calendar
  React.useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        // Use a minimal date range to check connection
        // Note: This will return 401 if not logged in with Google, which is expected
        const response = await fetch(
          "/api/google/events?start_date=2024-01-01&end_date=2024-01-02",
          {
            // Suppress console errors for expected 401 responses
            credentials: "same-origin",
          }
        );
        // 401 means not authenticated, which is expected if user hasn't logged in with Google
        setIsGoogleConnected(response.ok);
      } catch (error) {
        // Network or other errors - assume not connected
        // This is expected and not an error
        setIsGoogleConnected(false);
      }
    };
    checkGoogleConnection();
  }, []);

  // Fetch calendar events when dates change and use_calendar is enabled
  const startDate = form.watch("start_date");
  const endDate = form.watch("goal_date");
  const useCalendar = form.watch("use_calendar");

  React.useEffect(() => {
    if (useCalendar && startDate && endDate && isGoogleConnected) {
      fetchAndProcessCalendarEvents();
    }
  }, [useCalendar, startDate, endDate, isGoogleConnected]);

  const fetchAndProcessCalendarEvents = async () => {
    if (!startDate || !endDate) {
      setCalendarStatus("Please select both start and end dates");
      return;
    }

    setIsLoadingCalendar(true);
    setCalendarStatus("Fetching calendar events...");

    try {
      const calendarData = await fetchCalendarEvents(startDate, endDate);

      if (!calendarData) {
        setCalendarStatus("Failed to fetch calendar events");
        return;
      }

      const { events, eventsByDate } = calendarData;

      if (events.length === 0) {
        setCalendarStatus("No events found in the selected date range");
        form.setValue("calendar_events_summary", "No calendar events found.");
        return;
      }

      // Format events for the training plan
      const eventsSummary = formatEventsForTrainingPlan(eventsByDate, {
        start: startDate,
        end: endDate,
      });

      const recommendations = generateCalendarBasedRecommendations(
        eventsByDate,
        {
          start: startDate,
          end: endDate,
        }
      );

      const fullSummary = `${eventsSummary}\n${recommendations}`;

      form.setValue("calendar_events_summary", fullSummary);
      setCalendarStatus(`✓ Loaded ${events.length} calendar event(s)`);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      setCalendarStatus("Error fetching calendar events");
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // old one
  // const onSubmit = async (values: FormValues) => {
  //     console.log("=== TRAINING PLAN GENERATION ===")
  //     console.log("Form Data:", values)

  //     // Show the calendar data if available
  //     if (values.use_calendar && values.calendar_events_summary) {
  //         console.log("\n=== CALENDAR DATA ===")
  //         console.log(values.calendar_events_summary)
  //     }

  //     // TODO: Replace this with your actual plan generation logic
  //     // Example: Call your LLM API, generate plan, display results

  //     // For now, show an alert with the data
  //     const message = values.use_calendar
  //         ? `Plan generation submitted!\n\nGoal: ${values.goal_event}\nDates: ${values.start_date} to ${values.goal_date}\nCalendar Integration: ✓ Enabled\n\nCheck browser console (F12) to see full data including calendar events.`
  //         : `Plan generation submitted!\n\nGoal: ${values.goal_event}\nDates: ${values.start_date} to ${values.goal_date}\nCalendar Integration: Not enabled\n\nCheck browser console (F12) to see full data.`

  //     // Call the API to generate the plan
  //     setIsGenerating(true)
  //     try {
  //         const response = await fetch('/api/generate-plan', {
  //             method: 'POST',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify(values),
  //         })

  //         if (!response.ok) {
  //             throw new Error('Plan generation failed')
  //         }

  //         const result = await response.json()
  //         console.log("✅ Generated Plan:", result)

  //         // Store the plan in context so PlanOutput can display it
  //         setGeneratedPlan(result)

  //         alert(`✅ Plan generated successfully!\n\nClick on the "Your custom plan" section on the right to view it!`)

  //     } catch (error) {
  //         console.error("❌ Error generating plan:", error)
  //         alert("Failed to generate plan. Please try again.")
  //     } finally {
  //         setIsGenerating(false)
  //     }
  // }

  const onSubmit = async (values: FormValues) => {
    console.log("=== TRAINING PLAN GENERATION (FORM VALUES) ===");
    console.log(values);

    if (values.use_calendar && values.calendar_events_summary) {
      console.log("\n=== CALENDAR DATA ===");
      console.log(values.calendar_events_summary);
    }

    // Helper: estimate weeks from dates, or fall back to 8
    const computeWeeks = (start?: string, end?: string): number => {
      if (!start || !end) return 8;
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 8;
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffWeeks = diffMs / (1000 * 60 * 60 * 24 * 7);
      return Math.max(1, Math.round(diffWeeks));
    };

    const weeks = computeWeeks(values.start_date, values.goal_date);

    // Map fitness level string to the enum used by backend
    const experienceLevel = (
      values.fitness_level || "Intermediate"
    ).toLowerCase() as "beginner" | "intermediate" | "advanced";

    // Build a human-readable goal description
    const goalDescriptionParts = [
      `Goal event: ${values.goal_event}`,
      `Target: ${values.goal_target}`,
      `Fitness level: ${values.fitness_level}`,
      `Current weekly km: ${values.current_weekly_km}`,
    ];

    if (values.injury) {
      goalDescriptionParts.push(`Injuries/notes: ${values.injury}`);
    }
    if (values.country) {
      goalDescriptionParts.push(`Training country: ${values.country}`);
    }
    if (values.use_calendar && values.calendar_events_summary) {
      goalDescriptionParts.push(
        `Calendar constraints:\n${values.calendar_events_summary}`
      );
    }
    if (values.use_wearable) {
      goalDescriptionParts.push(
        `Wearable data summary:\n${values.wearable_data}`
      );
    }

    const goalDescription = goalDescriptionParts.join(" | ");

    // placeholder recent runs
    const recent_runs = [
      {
        date: "2025-10-28",
        distance_km: 10.2,
        duration_min: 54.0,
        avg_pace_min_per_km: 5.29,
        notes: "Felt strong but last 2km were hard",
      },
      {
        date: "2025-10-30",
        distance_km: 6.0,
        duration_min: 34.0,
        avg_pace_min_per_km: 5.67,
        notes: "Easy neighborhood run",
      },
      {
        date: "2025-11-02",
        distance_km: 14.0,
        duration_min: 80.0,
        avg_pace_min_per_km: 5.71,
        notes: "Long run, knee a bit sore in last 3km",
      },
    ];
    const payload: PlanRequestBody = {
      instruction: `Build a ${weeks}-week training plan for ${values.goal_event} with target: ${values.goal_target}`,
      country: "Singapore",
      weeks,
      runner_profile: {
        name: "Joel Sng",
        age: 25,
        sex: "male",
        experience_level: experienceLevel,
        weekly_mileage_km: values.current_weekly_km,
        preferred_units: "km",
        // For now, just assume generic training days; you can wire real choices later
        available_days: ["Mon", "Wed", "Sat", "Sun"],
        constraints: [
          ...(values.injury ? [values.injury] : []),
          ...(values.use_calendar && values.calendar_events_summary
            ? ["Plan must respect calendar constraints"]
            : []),
        ],
      },
      recent_runs,
      goal_description: goalDescription,
    };

    console.log("=== HELLO PAYLOAD SENT TO /api/plan ===");
    console.log(payload);

    setIsGenerating(true);
    setFocus("output");
    try {
      // This calls Next.js /api/plan → FastAPI /plan
      setFocus("output");
      const plan = await requestTrainingPlan(payload);
      console.log("Plan received from backend:", plan);

      // Store in context so PlanOutput can render later
      setGeneratedPlan(plan);

      toast("Plan generated successfully", {
        description: `Generated a ${plan.plan_duration_weeks}-week plan for ${plan.runner_name}`,
      });
    } catch (error) {
      console.error("Error generating plan:", error);
      toast("Failed to generate plan", {
        description: `${error}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const showAllContent = focus === "input";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Validation errors:", errors);
        })}
        className="space-y-6"
      >
        <div className="grid grid-rows-5 gap-8">
          {/* form row 1 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Goal Event */}
            <FormField
              control={form.control}
              name="goal_event"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Event</FormLabel>
                  <FormControl>
                    <Input placeholder="Half Marathon" {...field} />
                  </FormControl>
                  {showAllContent && (
                    <FormDescription>
                      The distance or race you’re training for.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Goal Target */}
            <FormField
              control={form.control}
              name="goal_target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Target</FormLabel>
                  <FormControl>
                    <Input placeholder="Finish under 2 hours" {...field} />
                  </FormControl>
                  {showAllContent && (
                    <FormDescription>
                      Describe your performance target or goal.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* form row2 */}
          <div className="grid grid-cols-2 gap-4">
            <DatePickerField
              control={form.control}
              name="start_date"
              label="Start Date"
            />
            <DatePickerField
              control={form.control}
              name="goal_date"
              label="Goal Date"
            />
          </div>

          {/* form row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fitness_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fitness Level</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Beginner / Intermediate / Advanced"
                      {...field}
                    />
                  </FormControl>
                  {showAllContent && (
                    <FormDescription>
                      General training experience or fitness level.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Country */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Singapore" {...field} />
                  </FormControl>
                  {showAllContent && (
                    <FormDescription>
                      Where will you be training and competing in.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* form row 4 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Days per Week */}
            <FormField
              control={form.control}
              name="days_per_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days per Week</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={7}
                      placeholder="4"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  {showAllContent && (
                    <FormDescription>
                      How many days you can train per week.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* weekly distance current */}
            <FormField
              control={form.control}
              name="current_weekly_km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Weekly Distance (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="35"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  {showAllContent && (
                    <FormDescription>
                      Approximate weekly mileage currently.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* form row 5 */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="injury"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Injury (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  {showAllContent && (
                    <FormDescription>
                      Any past injuries you would like to highlight.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Google Calendar Integration Section */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Google Calendar Integration
                </h4>
                <p className="text-xs text-muted-foreground">
                  Consider your schedule when generating the plan
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isGoogleConnected ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600 text-xs">
                      <CheckCircle2 className="h-4 w-4" />
                      Connected
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <XCircle className="h-4 w-4" />
                    Not Connected
                  </div>
                )}
              </div>
            </div>

            {!isGoogleConnected ? (
              <GoogleLogInButton />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="use_calendar"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Use my calendar schedule</FormLabel>
                        <FormDescription className="text-xs">
                          Generate a training plan that works around your
                          existing commitments
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {useCalendar && (
                  <div className="space-y-2">
                    {isLoadingCalendar && (
                      <p className="text-xs text-muted-foreground">
                        Loading calendar events...
                      </p>
                    )}
                    {calendarStatus && (
                      <p
                        className={`text-xs ${calendarStatus.includes("✓")
                          ? "text-green-600"
                          : "text-muted-foreground"
                          }`}
                      >
                        {calendarStatus}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fetchAndProcessCalendarEvents}
                      disabled={isLoadingCalendar || !startDate || !endDate}
                    >
                      Refresh Calendar Events
                    </Button>
                  </div>
                )}

                <GoogleLogoutButton />
              </>
            )}
          </div>
        </div>

        {/* Wearable Integration Section */}
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Watch className="h-4 w-4" />
                Wearable Integration
              </h4>
              <p className="text-xs text-muted-foreground">
                Consider your recovery metrics when planning workouts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                Simulation Mode
              </div>










            </div>
          </div>

          <FormField
            control={form.control}
            name="use_wearable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Use wearable data
                  </FormLabel>
                  <FormDescription className="text-xs">
                    Generate a training plan that adapts to your recovery state
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {form.watch("use_wearable") && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="activity_level"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(value: "sedentary" | "moderate" | "high") => {
                        field.onChange(value);
                        form.setValue("wearable_data", activitySummaries[value]);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="moderate">Moderately Active</SelectItem>
                        <SelectItem value="high">Highly Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your typical activity level
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="p-3 bg-muted/50 rounded-md space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Heart Rate</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {activitySummaries[form.watch("activity_level") ?? "sedentary"].averageHeartRate}
                      </span>
                      <span className="text-xs text-muted-foreground">bpm</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">HRV</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {activitySummaries[form.watch("activity_level") ?? "sedentary"].averageHRV}
                      </span>
                      <span className="text-xs text-muted-foreground">ms</span>
                    </div>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Sleep Score</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {activitySummaries[form.watch("activity_level") ?? "sedentary"].sleepQuality}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Recovery Status</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {activitySummaries[form.watch("activity_level") ?? "sedentary"].recoveryStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Daily Steps</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {activitySummaries[form.watch("activity_level") ?? "sedentary"].averageSteps.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Active Calories</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {activitySummaries[form.watch("activity_level") ?? "sedentary"].averageActiveCalories}
                      </span>
                      <span className="text-xs text-muted-foreground">kcal</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t">
                  <p className="text-sm font-medium">Fitness Assessment</p>
                  <p className="text-sm">
                    Based on your metrics, you are classified as{" "}
                    <span className="font-semibold">
                      {activitySummaries[form.watch("activity_level") ?? "sedentary"].fitnessLevel}
                    </span>
                    {" "}with a{" "}
                    <span className="font-semibold lowercase">
                      {activitySummaries[form.watch("activity_level") ?? "sedentary"].recoveryStatus}
                    </span>
                    {" "}recovery capacity.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={!showAllContent || form.formState.isSubmitting}
          // onClick={() =>
          //     toast("Event has been created", {
          //         description: "Sunday, December 03, 2023 at 9:00 AM",
          //         action: {
          //             label: "Undo",
          //             onClick: () => console.log("Undo"),
          //         },
          //     })
          // }
          >
            {form.formState.isSubmitting ? "Generating..." : "Generate Plan"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={!showAllContent || form.formState.isSubmitting}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
