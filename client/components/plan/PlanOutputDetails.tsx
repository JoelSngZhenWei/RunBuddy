"use client"

import { CardContent, CardHeader } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { usePlan } from "@/contexts/PlanContext";
import { WeeklyPlanCard } from "./PlanOutputWeeklyPlanCard";
import { OverallWorkoutGraph } from "./WorkoutGraphOverall";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { WorkoutAtAGlance } from "./PlanOutputWorkoutGlance";
import { Button } from "../ui/button";
import { Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { addPlanToGoogleCalendar } from "@/lib/calendar-event-utils";
import { toast } from "sonner";
import { useState } from "react";
import * as React from "react";


export default function PlanOutputDetails() {
    const { generatedPlan, isGenerating, planStartDate } = usePlan()
    const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)
    const [isGoogleConnected, setIsGoogleConnected] = useState(false)

    // Check Google Calendar connection status
    React.useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch("/api/google/events?start_date=2024-01-01&end_date=2024-01-02", {
                    credentials: "same-origin",
                })
                setIsGoogleConnected(response.ok)
            } catch {
                setIsGoogleConnected(false)
            }
        }
        checkConnection()
    }, [])

    const handleAddToCalendar = async () => {
        if (!generatedPlan || !planStartDate) {
            toast.error("Missing plan or start date", {
                description: "Please regenerate the plan with a start date.",
            })
            return
        }

        if (!isGoogleConnected) {
            toast.error("Not connected to Google Calendar", {
                description: "Please connect your Google Calendar first.",
            })
            return
        }

        setIsAddingToCalendar(true)
        try {
            const result = await addPlanToGoogleCalendar(generatedPlan, planStartDate)
            
            if (result.success) {
                toast.success("Plan added to calendar!", {
                    description: `Successfully added ${result.created} workout${result.created !== 1 ? 's' : ''} to your Google Calendar.`,
                    duration: 5000,
                })
            } else {
                toast.error("Some events failed to add", {
                    description: `Added ${result.created} events, but ${result.failed} failed.`,
                })
            }
        } catch (error: any) {
            console.error("Error adding plan to calendar:", error)
            toast.error("Failed to add plan to calendar", {
                description: error.message || "Please try again or check your Google Calendar connection.",
            })
        } finally {
            setIsAddingToCalendar(false)
        }
    }

    // If generating, show loading state
    if (isGenerating) {
        return (
            <CardContent className="space-y-6 text-sm">
                <ScrollArea className="h-[85vh] pb-10">
                    <div className="flex flex-col items-center justify-center h-full py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-muted-foreground">Generating your personalized training plan...</p>
                        <p className="text-xs text-muted-foreground mt-2">This may take 10-20 seconds</p>
                    </div>
                </ScrollArea>
            </CardContent>
        )
    }

    // If plan exists, show it
    if (generatedPlan) {

        return (
            <CardContent className="space-y-6 text-sm">
                {/* Add to Calendar Button */}
                {planStartDate && (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <div>
                                <p className="text-sm font-medium">Add to Google Calendar</p>
                                <p className="text-xs text-muted-foreground">
                                    Add all workouts from this plan to your calendar
                                </p>
                            </div>
                        </div>
                        {isGoogleConnected ? (
                            <Button
                                onClick={handleAddToCalendar}
                                disabled={isAddingToCalendar}
                                variant="default"
                                size="sm"
                            >
                                {isAddingToCalendar ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Add to Calendar
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <XCircle className="h-4 w-4" />
                                Not connected
                            </div>
                        )}
                    </div>
                )}

                <ScrollArea className="h-[85vh] pb-10">
                    <Tabs defaultValue="breakdown" className="flex flex-col gap-4">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="breakdown">
                                Weekly Breakdown
                            </TabsTrigger>
                            <TabsTrigger value="glance">
                                Your Workout at a Glance
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Weekly Breakdown (current UI) */}
                        <TabsContent value="breakdown" className="mt-0">
                            <div className="flex flex-col gap-3">
                                <div className="border rounded-lg p-5">
                                    <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                                        <h2 className="text-base font-semibold">
                                            Training Plan Overview
                                        </h2>
                                        <span className="uppercase font-strong text-muted-foreground bg-background border px-2 py-0.5 rounded-md">
                                            {generatedPlan.plan_duration_weeks}-Week Plan
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm flex flex-col gap-2">
                                        <div>
                                            <p className="text-xl font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                                                Goal
                                            </p>
                                            <p className="text-muted-foreground">
                                                {generatedPlan.goal_description}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xl font-semibold uppercase tracking-wide text-muted-foreground">
                                                Overview
                                            </p>
                                            <p className="text-muted-foreground">
                                                {generatedPlan.weekly_overview}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-lg">
                                    <OverallWorkoutGraph weeklyPlans={generatedPlan.weekly_plans} />
                                </div>

                                {/* Weekly Cards */}
                                {generatedPlan.weekly_plans.map((week) => (
                                    <WeeklyPlanCard key={week.week_number} week={week} />
                                ))}
                            </div>
                        </TabsContent>

                        {/* Tab 2: Your Workout at a Glance (new component) */}
                        <TabsContent value="glance" className="mt-0">
                            <WorkoutAtAGlance plan={generatedPlan} />
                        </TabsContent>
                    </Tabs>
                </ScrollArea>
            </CardContent>
            // <CardContent className="space-y-6 text-sm">
            //     <ScrollArea className="h-[85vh] pb-10">
            //         <div className="prose prose-sm dark:prose-invert max-w-none">
            //             <ReactMarkdown
            //                 components={{
            //                     h1: ({node, ...props}) => <h1 className="font-bold text-xl mb-3 mt-6" {...props} />,
            //                     h2: ({node, ...props}) => <h2 className="font-semibold text-lg mb-2 mt-5" {...props} />,
            //                     h3: ({node, ...props}) => <h3 className="font-semibold text-base mb-2 mt-4" {...props} />,
            //                     h4: ({node, ...props}) => <h4 className="font-medium text-sm mb-1 mt-3" {...props} />,
            //                     p: ({node, ...props}) => <p className="text-muted-foreground mb-3" {...props} />,
            //                     ul: ({node, ...props}) => <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4" {...props} />,
            //                     ol: ({node, ...props}) => <ol className="list-decimal list-inside text-muted-foreground space-y-1 mb-4" {...props} />,
            //                     li: ({node, ...props}) => <li className="text-muted-foreground" {...props} />,
            //                     strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
            //                     em: ({node, ...props}) => <em className="italic" {...props} />,
            //                 }}
            //             >
            //                 {generatedPlan.plan}
            //             </ReactMarkdown>

            //             {generatedPlan.metadata?.calendarIntegration && (
            //                 <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            //                     <p className="text-sm text-green-800 dark:text-green-200">
            //                         ✓ This plan has been customized based on your Google Calendar schedule
            //                     </p>
            //                 </div>
            //             )}
            //         </div>
            //     </ScrollArea>
            // </CardContent>
        )
    }

    // Default: Show example/placeholder
    return (
        <CardContent className="space-y-6 text-sm">
            <ScrollArea className="h-[85vh] pb-10">
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <p className="text-muted-foreground mb-4">No training plan generated yet.</p>
                    <p className="text-xs text-muted-foreground max-w-md">
                        Fill in the form on the left and click "Generate Plan" to create your personalized training schedule.
                    </p>
                </div>
            </ScrollArea>
        </CardContent>

    )
}
