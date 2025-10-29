"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trainingPlanSchema } from "@/lib/schemas/TrainingPlanSchema"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchCalendarEvents, formatEventsForTrainingPlan, generateCalendarBasedRecommendations } from "@/lib/calendar-utils"
import GoogleLogInButton from "@/components/GoogleLogInButton"
import GoogleLogoutButton from "@/components/GoogleLogoutButton"
import { Calendar, CheckCircle2, XCircle } from "lucide-react"
import { usePlan } from "@/contexts/PlanContext"


type FormValues = z.infer<typeof trainingPlanSchema>

export function PlanInputForm({ focus }: { focus: "input" | "output" }) {
    const [isGoogleConnected, setIsGoogleConnected] = React.useState(false)
    const [isLoadingCalendar, setIsLoadingCalendar] = React.useState(false)
    const [calendarStatus, setCalendarStatus] = React.useState<string>("")
    const { setGeneratedPlan, setIsGenerating } = usePlan()

    const form = useForm<FormValues>({
        resolver: zodResolver(trainingPlanSchema),
        defaultValues: {
            goal_event: "",
            goal_target: "",
            days_per_week: 4,
            current_weekly_km: 35,
            fitness_level: "Intermediate",
            country: "",
            start_date: "",
            goal_date: "",
            use_calendar: false,
            calendar_events_summary: "",
        },
    })

    // Check if user is connected to Google Calendar
    React.useEffect(() => {
        const checkGoogleConnection = async () => {
            try {
                const response = await fetch("/api/google/events?start_date=2024-01-01&end_date=2024-01-02")
                setIsGoogleConnected(response.ok)
            } catch {
                setIsGoogleConnected(false)
            }
        }
        checkGoogleConnection()
    }, [])

    // Fetch calendar events when dates change and use_calendar is enabled
    const startDate = form.watch("start_date")
    const endDate = form.watch("goal_date")
    const useCalendar = form.watch("use_calendar")

    React.useEffect(() => {
        if (useCalendar && startDate && endDate && isGoogleConnected) {
            fetchAndProcessCalendarEvents()
        }
    }, [useCalendar, startDate, endDate, isGoogleConnected])

    const fetchAndProcessCalendarEvents = async () => {
        if (!startDate || !endDate) {
            setCalendarStatus("Please select both start and end dates")
            return
        }

        setIsLoadingCalendar(true)
        setCalendarStatus("Fetching calendar events...")

        try {
            const calendarData = await fetchCalendarEvents(startDate, endDate)
            
            if (!calendarData) {
                setCalendarStatus("Failed to fetch calendar events")
                return
            }

            const { events, eventsByDate } = calendarData
            
            if (events.length === 0) {
                setCalendarStatus("No events found in the selected date range")
                form.setValue("calendar_events_summary", "No calendar events found.")
                return
            }

            // Format events for the training plan
            const eventsSummary = formatEventsForTrainingPlan(eventsByDate, {
                start: startDate,
                end: endDate,
            })

            const recommendations = generateCalendarBasedRecommendations(eventsByDate, {
                start: startDate,
                end: endDate,
            })

            const fullSummary = `${eventsSummary}\n${recommendations}`
            
            form.setValue("calendar_events_summary", fullSummary)
            setCalendarStatus(`✓ Loaded ${events.length} calendar event(s)`)
        } catch (error) {
            console.error("Error fetching calendar events:", error)
            setCalendarStatus("Error fetching calendar events")
        } finally {
            setIsLoadingCalendar(false)
        }
    }

    const onSubmit = async (values: FormValues) => {
        console.log("=== TRAINING PLAN GENERATION ===")
        console.log("Form Data:", values)
        
        // Show the calendar data if available
        if (values.use_calendar && values.calendar_events_summary) {
            console.log("\n=== CALENDAR DATA ===")
            console.log(values.calendar_events_summary)
        }
        
        // TODO: Replace this with your actual plan generation logic
        // Example: Call your LLM API, generate plan, display results
        
        // For now, show an alert with the data
        const message = values.use_calendar 
            ? `Plan generation submitted!\n\nGoal: ${values.goal_event}\nDates: ${values.start_date} to ${values.goal_date}\nCalendar Integration: ✓ Enabled\n\nCheck browser console (F12) to see full data including calendar events.`
            : `Plan generation submitted!\n\nGoal: ${values.goal_event}\nDates: ${values.start_date} to ${values.goal_date}\nCalendar Integration: Not enabled\n\nCheck browser console (F12) to see full data.`
        
        // Call the API to generate the plan
        setIsGenerating(true)
        try {
            const response = await fetch('/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })
            
            if (!response.ok) {
                throw new Error('Plan generation failed')
            }
            
            const result = await response.json()
            console.log("✅ Generated Plan:", result)
            
            // Store the plan in context so PlanOutput can display it
            setGeneratedPlan(result)
            
            alert(`✅ Plan generated successfully!\n\nClick on the "Your custom plan" section on the right to view it!`)
            
        } catch (error) {
            console.error("❌ Error generating plan:", error)
            alert("Failed to generate plan. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    const showDescriptions = focus === "input"

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-rows-4 gap-8">
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
                                    {showDescriptions && (
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
                                    {showDescriptions && (
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
                                    {showDescriptions && (
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
                                    {showDescriptions && (
                                        <FormDescription>
                                            Approximate weekly mileage currently.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
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
                                        <Input placeholder="Beginner / Intermediate / Advanced" {...field} />
                                    </FormControl>
                                    {showDescriptions && (
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
                                    {showDescriptions && (
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
                        {/* Dates */}
                        <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="goal_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
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
                                                <FormLabel>
                                                    Use my calendar schedule
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    Generate a training plan that works around your existing commitments
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {useCalendar && (
                                    <div className="space-y-2">
                                        {isLoadingCalendar && (
                                            <p className="text-xs text-muted-foreground">Loading calendar events...</p>
                                        )}
                                        {calendarStatus && (
                                            <p className={`text-xs ${calendarStatus.includes("✓") ? "text-green-600" : "text-muted-foreground"}`}>
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

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Generating..." : "Generate Plan"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={form.formState.isSubmitting}
                    >
                        Reset
                    </Button>
                </div>
            </form>
        </Form>
    )
}
